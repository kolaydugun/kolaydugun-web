import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './AdminMessaging.css';

const AdminMessaging = ({ onBack }) => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user]);

    useEffect(() => {
        let interval;
        if (selectedConversation) {
            setMessages([]); // Clear previous messages
            fetchMessages(selectedConversation.id);

            // Poll for new messages every 5 seconds
            interval = setInterval(() => {
                fetchMessages(selectedConversation.id);
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedConversation]);

    // Fetch support conversations where current user is the USER (client)
    const fetchConversations = async () => {
        try {
            // 1. Find the Support Vendor ID
            const { data: supportVendor, error: vendorError } = await supabase
                .from('vendors')
                .select('id, business_name, user_id') // We need user_id (receiver) for sending messages
                .ilike('business_name', '%KolayDugun Destek%')
                .limit(1)
                .maybeSingle();

            if (vendorError || !supportVendor) {
                console.error('Support vendor not found');
                setConversations([]);
                setLoading(false);
                return;
            }

            // 2. Fetch conversations with this vendor
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    id,
                    updated_at,
                    created_at,
                    vendor:vendors(business_name, id, user_id),
                    messages(content, created_at, sender_id, read_at)
                `)
                .eq('user_id', user.id)
                .eq('vendor_id', supportVendor.id)
                .order('updated_at', { ascending: false });

            if (data) {
                // Transform to match existing UI structure
                const formatted = data.map(c => {
                    const lastMsg = c.messages?.[c.messages.length - 1] || null;
                    const unreadCount = c.messages?.filter(m => m.sender_id !== user.id && !m.read_at).length || 0;

                    return {
                        id: c.id,
                        admin_id: supportVendor.user_id, // Store vendor's user_id as 'admin_id' for logic
                        vendor_id: supportVendor.id,     // Store actual vendor id
                        updated_at: c.updated_at,
                        last_message_at: c.updated_at,
                        unread_count: unreadCount,
                        last_message: lastMsg,
                        other_user_profile: {
                            business_name: supportVendor.business_name
                        }
                    };
                });
                setConversations(formatted);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-select new chat if list is empty
    useEffect(() => {
        if (!loading && conversations.length === 0) {
            setSelectedConversation({
                id: 'new_support_chat', // Changed ID to distinguish
                admin_id: null,
                updated_at: new Date().toISOString()
            });
        }
    }, [loading, conversations]);

    const fetchMessages = async (conversationId) => {
        if (!conversationId || conversationId === 'new_support_chat') return;

        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            let conversationId = selectedConversation?.id;

            // If new chat, we need to CREATE the conversation first
            if (!conversationId || conversationId === 'new_support_chat') {
                // Find Support Vendor again to be safe
                const { data: supportVendor } = await supabase
                    .from('vendors')
                    .select('id, user_id')
                    .ilike('business_name', '%KolayDugun Destek%')
                    .single();

                if (!supportVendor) {
                    alert('Destek hattına ulaşılamıyor.');
                    return;
                }

                // Create Conversation
                const { data: newConv, error: createError } = await supabase
                    .from('conversations')
                    .insert({
                        vendor_id: supportVendor.id,
                        user_id: user.id,
                        lead_id: null
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                conversationId = newConv.id;
            }

            // Determine Receiver ID
            let receiverId = selectedConversation?.admin_id;
            if (!receiverId) {
                const { data: supportVendor } = await supabase
                    .from('vendors')
                    .select('user_id')
                    .ilike('business_name', '%KolayDugun Destek%')
                    .maybeSingle();
                receiverId = supportVendor?.user_id;
            }

            // Send Message
            const { data: message, error: msgError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content: newMessage.trim()
                })
                .select()
                .single();

            if (msgError) throw msgError;

            // Update local state
            setMessages(prev => [...prev, message]);
            setNewMessage('');

            // Create notification for the Admin (Support Vendor)
            try {
                const targetUserId = receiverId || selectedConversation?.admin_id;

                if (targetUserId) {
                    const { data: myVendor } = await supabase
                        .from('vendors')
                        .select('business_name')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    const senderName = myVendor?.business_name || user.email;
                    const messagePreview = newMessage.trim().substring(0, 100);
                    const notificationTitle = `Yeni mesaj: ${senderName}`;
                    const notificationBody = `📝 ${messagePreview}`;

                    const { error: notifError } = await supabase
                        .from('user_notifications')
                        .insert({
                            user_id: targetUserId,
                            type: 'new_message',
                            title: notificationTitle,
                            message: notificationBody,
                            related_conversation_id: conversationId,
                            related_message_id: message.id,
                            is_read: false
                        });

                    if (notifError) console.error('Notification insert error:', notifError);
                    else console.log('Notification sent via AdminMessaging to', targetUserId);
                }
            } catch (notifError) {
                console.error('Error creating notification:', notifError);
            }

            // Refresh conversations/messages if needed
            if (selectedConversation?.id === 'new_support_chat') {
                fetchConversations();
            }

        } catch (error) {
            console.error('Error sending message:', error);
            alert('Mesaj gönderilemedi.');
        }
    };

    const getConversationName = (conv) => {
        if (!conv) return 'Yönetici';
        if (conv.id === 'new_admin_chat') return 'Yönetici';

        // Check user_profile first (from backend)
        if (conv.user_profile) {
            if (conv.user_profile.name && conv.user_profile.surname) {
                return `${conv.user_profile.name} ${conv.user_profile.surname}`;
            }
            if (conv.user_profile.name) {
                return conv.user_profile.name;
            }
        }

        // Check vendor profile
        if (conv.other_user_profile?.business_name) {
            return conv.other_user_profile.business_name;
        }

        // Fallback to email - extract name part and capitalize
        let email = null;
        if (conv.user_profile?.email) {
            email = conv.user_profile.email;
        } else if (conv.user?.email) {
            email = conv.user.email;
        } else {
            const otherUser = conv.admin_id === user.id ? conv.user : conv.admin;
            email = otherUser?.email;
        }

        if (email) {
            const namePart = email.split('@')[0];
            // Capitalize first letter
            return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }

        return t('dashboard.supportRequest');
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return t('dashboard.justNow');
        if (diff < 3600) return `${Math.floor(diff / 60)} ${t('dashboard.minutesAgo')}`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('dashboard.hoursAgo')}`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ${t('dashboard.daysAgo')}`;
        return date.toLocaleDateString('tr-TR');
    };

    const filteredConversations = conversations.filter(c =>
        getConversationName(c).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="vendor-messages-container">{t('dashboard.loading')}</div>;
    }

    return (
        <div className="vendor-messages-container">
            <div className={`conversations-list ${selectedConversation ? 'mobile-hidden' : ''}`}>
                <div className="messages-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                padding: '5px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            title={t('common.back')}
                        >
                            ←
                        </button>
                    )}
                    <h2 style={{ margin: 0 }}>{t('dashboard.contactAdmin')}</h2>
                    <div className="header-actions">
                        {/* Contact Admin button removed as we are already in admin view */}
                    </div>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder={t('messages.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="conversations-scroll">
                    {filteredConversations.length === 0 ? (
                        <div className="no-conversations">
                            <p>{t('dashboard.noMessages')}</p>
                            <button
                                onClick={() => setSelectedConversation({ admin_id: 'admin', id: 'new_admin_chat' })}
                                style={{
                                    marginTop: '10px',
                                    padding: '8px 16px',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {t('dashboard.contactAdmin')}
                            </button>
                        </div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                                onClick={() => setSelectedConversation(conv)}
                            >
                                <div className="avatar">
                                    {getConversationName(conv).charAt(0).toUpperCase()}
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-top">
                                        <span className="user-name">{getConversationName(conv)}</span>
                                        <span className="time">{formatTime(conv.last_message_at)}</span>
                                    </div>
                                    <p className="last-message">
                                        {conv.last_message?.content?.substring(0, 50) || t('dashboard.noMessage')}
                                    </p>
                                </div>
                                {conv.unread_count > 0 && <span className="unread-badge">{conv.unread_count}</span>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={`chat-window ${!selectedConversation ? 'mobile-hidden' : ''}`}>
                {selectedConversation ? (
                    <>
                        <div className="chat-header">
                            <button className="back-button" onClick={() => setSelectedConversation(null)}>
                                ←
                            </button>
                            <div className="avatar-small">
                                {getConversationName(selectedConversation).charAt(0).toUpperCase()}
                            </div>
                            <h3>{getConversationName(selectedConversation)}</h3>
                        </div>
                        <div className="messages-feed">
                            {messages.map(msg => {
                                const isMe = msg.sender_id === user.id;
                                const senderName = isMe
                                    ? (t('dashboard.me') || 'Siz')
                                    : getConversationName(selectedConversation);

                                return (
                                    <div
                                        key={msg.id}
                                        className={`message-bubble ${isMe ? 'vendor' : 'user'}`}
                                    >
                                        <span className="sender-name-label">{senderName}</span>
                                        <p>{msg.content}</p>
                                        <span className="message-time">
                                            {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <form className="message-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={t('messages.typePlaceholder')}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                                {newMessage.trim() ? (
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                                    </svg>
                                ) : (
                                    <span style={{ opacity: 0.5 }}>➤</span>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-selection">
                        <div className="placeholder-icon">💬</div>
                        <p>{t('messages.noSelection')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessaging;
