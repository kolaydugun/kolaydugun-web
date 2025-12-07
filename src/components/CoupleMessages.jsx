import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import './CoupleMessages.css';

const CoupleMessages = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return t('dashboard.justNow') || 'Az önce';
        if (diff < 3600) return `${Math.floor(diff / 60)} ${t('dashboard.minutesAgo') || 'dk önce'}`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('dashboard.hoursAgo') || 'saat önce'}`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} ${t('dashboard.daysAgo') || 'gün önce'}`;
        return date.toLocaleDateString('tr-TR');
    };

    const fetchConversations = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            // 1. Fetch Vendor Conversations
            const fetchVendorConvs = async () => {
                const { data: convData, error: convError } = await supabase
                    .from('conversations')
                    .select(`
                        id,
                        created_at,
                        updated_at,
                        lead_id,
                        vendor_id,
                        vendor:vendors(id, business_name, user_id, category),
                        lead:leads(id, event_date, contact_name)
                    `)
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false });

                if (convError) {
                    console.error("Error fetching vendor conversations", convError);
                    return [];
                }

                return (convData || []).map(conv => ({
                    id: conv.id,
                    vendor_id: conv.vendor_id,
                    vendor_name: conv.vendor?.business_name || 'Bilinmeyen Satıcı',
                    vendor_user_id: conv.vendor?.user_id,
                    category: conv.vendor?.category,
                    updated_at: conv.updated_at,
                    last_message: "Sohbeti görüntüle",
                    lead_id: conv.lead_id,
                    contact_name: conv.lead?.contact_name,
                    event_date: conv.lead?.event_date,
                    conversation_id: conv.id,
                    is_admin_chat: false
                }));
            };

            // 2. Fetch Admin Conversations
            const fetchAdminConvs = async () => {
                try {
                    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/list_admin_conversations`, {
                        headers: {
                            'Authorization': `Bearer ${session?.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) return [];

                    const result = await response.json();
                    return (result.conversations || []).map(conv => {
                        const isAdmin = user.id === conv.admin_id;
                        // If I am the admin, I want to see the other user's name (user_profile.full_name or vendor name)
                        // If I am the user, I want to see "Canlı Destek"

                        let displayName = t('dashboard.liveSupport') || 'Canlı Destek';

                        if (isAdmin) {
                            if (conv.other_user_profile?.business_name) {
                                displayName = conv.other_user_profile.business_name;
                            } else if (conv.user_profile?.full_name) {
                                displayName = conv.user_profile.full_name;
                            } else if (conv.user_profile?.email) {
                                displayName = conv.user_profile.email;
                            } else {
                                displayName = 'Kullanıcı';
                            }
                        }

                        return {
                            id: conv.id,
                            conversation_id: conv.id,
                            vendor_name: displayName,
                            vendor_id: null,
                            category: 'Support',
                            updated_at: conv.last_message_at || conv.created_at,
                            last_message: conv.last_message?.content || 'Destek talebi',
                            unread_count: conv.unread_count || 0,
                            is_admin_chat: true,
                            admin_id: conv.admin_id,
                            other_user_id: conv.admin_id === user.id ? conv.user_id : conv.admin_id
                        };
                    });
                } catch (e) {
                    console.error("Error fetching admin conversations", e);
                    return [];
                }
            };

            const [vendorConvs, adminConvs] = await Promise.all([fetchVendorConvs(), fetchAdminConvs()]);
            console.log('Admin Convs:', adminConvs);
            console.log('Vendor Convs:', vendorConvs);

            const allConvs = [...adminConvs, ...vendorConvs].sort((a, b) =>
                new Date(b.updated_at) - new Date(a.updated_at)
            );

            setConversations(allConvs);

            const supportRequested = searchParams.get('support') === 'true';
            const urlConversationId = searchParams.get('conversation');

            if (urlConversationId) {
                const target = allConvs.find(c => c.id === urlConversationId);
                if (target) setSelectedLead(target);
            } else if (supportRequested) {
                const existingAdminChat = allConvs.find(c => c.is_admin_chat);
                if (existingAdminChat) {
                    setSelectedLead(existingAdminChat);
                } else {
                    initiateSupportChat();
                }
            }

        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [user, t]);

    const fetchMessages = async (activeChat) => {
        if (!activeChat.conversation_id && activeChat.id !== 'new_support_chat') return;

        if (activeChat.id === 'new_support_chat') {
            setMessages([]);
            return;
        }

        try {
            if (activeChat.is_admin_chat) {
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch(
                    `${supabase.supabaseUrl}/functions/v1/get_admin_messages?conversation_id=${activeChat.conversation_id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${session?.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                const result = await response.json();
                if (result.messages) {
                    setMessages(result.messages);
                }
            } else {
                const { data: msgs, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', activeChat.conversation_id)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setMessages(msgs || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        if (selectedLead) {
            setMessages([]);
            fetchMessages(selectedLead);

            if (!selectedLead.is_admin_chat && selectedLead.conversation_id) {
                const subscription = supabase
                    .channel(`messages:${selectedLead.conversation_id}`)
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'messages',
                            filter: `conversation_id=eq.${selectedLead.conversation_id}`
                        },
                        (payload) => {
                            setMessages(prev => [...prev, payload.new]);
                            scrollToBottom();
                        }
                    )
                    .subscribe();

                return () => {
                    subscription.unsubscribe();
                };
            }
        }
    }, [selectedLead]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initiateSupportChat = () => {
        const newSupportChat = {
            id: 'new_support_chat',
            conversation_id: 'new_support_chat',
            vendor_name: t('dashboard.liveSupport') || 'Canlı Destek',
            created_at: new Date().toISOString(),
            is_admin_chat: true,
            messages: []
        };
        setConversations(prev => [newSupportChat, ...prev]);
        setSelectedLead(newSupportChat);
        fetchMessages(newSupportChat);
    }

    const handleSendMessage = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!newMessage.trim() || !selectedLead) return;

        console.log('🚀 [DEBUG] Starting handleSendMessage');
        console.log('📝 [DEBUG] Message:', newMessage);
        console.log('👤 [DEBUG] Selected Lead:', selectedLead);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            console.log('🔑 [DEBUG] Session:', session ? 'Valid' : 'Invalid');

            if (selectedLead.is_admin_chat) {
                console.log('💬 [DEBUG] Admin chat detected');
                const receiverId = selectedLead.id === 'new_support_chat' ? null : selectedLead.other_user_id;
                console.log('🎯 [DEBUG] Receiver ID:', receiverId);

                const payload = {
                    receiver_id: receiverId,
                    content: newMessage,
                    user_type: 'couple'
                };
                console.log('📦 [DEBUG] Payload:', payload);

                const url = `${supabase.supabaseUrl}/functions/v1/send_admin_message`;
                console.log('🌐 [DEBUG] URL:', url);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                console.log('📡 [DEBUG] Response status:', response.status);
                const result = await response.json();
                console.log('📥 [DEBUG] Response data:', result);

                if (result.message) {
                    console.log('✅ [DEBUG] Message sent successfully');
                    setMessages(prev => [...prev, result.message]);
                    setNewMessage('');

                    if (selectedLead.id === 'new_support_chat') {
                        console.log('🔄 [DEBUG] Refreshing conversations for new chat');
                        fetchConversations();
                    }
                } else {
                    console.error('❌ [DEBUG] Send failed:', result);
                    alert(`${t('messages.sendError') || 'Mesaj gönderilemedi'}: ${result.error || 'Bilinmeyen hata'}`);
                }

            } else {
                console.log('🏪 [DEBUG] Vendor chat detected');
                let conversationId = selectedLead.conversation_id;

                if (!conversationId) {
                    const { data: newConv, error: createError } = await supabase
                        .from('conversations')
                        .insert({
                            vendor_id: selectedLead.vendor_id,
                            user_id: user.id,
                            lead_id: selectedLead.lead_id
                        })
                        .select()
                        .single();
                    if (createError) throw createError;
                    conversationId = newConv.id;
                }

                const { data: sentMessage, error: sendError } = await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conversationId,
                        sender_id: user.id,
                        content: newMessage.trim()
                    })
                    .select()
                    .single();

                if (sendError) throw sendError;

                await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);

                setMessages(prev => [...prev, sentMessage]);
                setNewMessage('');
            }
            scrollToBottom();
        } catch (error) {
            console.error('💥 [DEBUG] Error in handleSendMessage:', error);
            alert(`${t('messages.sendError') || 'Mesaj gönderilemedi.'}`);
        }
    };

    return (
        <div className="couple-messages-container">
            <div className="conversations-sidebar">
                <div className="sidebar-header" style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{t('messages.myMessages') || 'Mesajlarım'}</h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            initiateSupportChat();
                        }}
                        style={{
                            background: '#FF4081',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '15px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                        }}
                    >
                        {t('dashboard.liveSupport') || 'Canlı Destek'}
                    </button>
                </div>
                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <div className="no-conversations">
                            <p>{t('messages.noRequests') || 'Henüz mesajınız yok.'}</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div
                                key={conv.id}
                                className={`conversation-item ${selectedLead?.id === conv.id ? 'active' : ''}`}
                                onClick={() => setSelectedLead(conv)}
                                style={conv.is_admin_chat ? { borderLeft: '3px solid #FF4081' } : {}}
                            >
                                <div className="conversation-avatar">
                                    {conv.is_admin_chat ? '🎧' : conv.vendor_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="conversation-info">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4>{conv.vendor_name}</h4>
                                        {conv.unread_count > 0 && (
                                            <span style={{
                                                background: '#FF4081', color: 'white', borderRadius: '50%',
                                                padding: '2px 6px', fontSize: '0.7rem', height: 'fit-content'
                                            }}>
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.85rem' }}>
                                        <span>
                                            {conv.last_message && conv.last_message.length > 30
                                                ? `${conv.last_message.substring(0, 30)}...`
                                                : (conv.last_message || '')}
                                        </span>
                                        <span>{formatTime(conv.updated_at)}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="chat-area">
                {selectedLead ? (
                    <>
                        <div className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="avatar-small" style={{
                                    width: '32px', height: '32px', background: '#ccc', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem'
                                }}>
                                    {selectedLead.is_admin_chat ? '🎧' : selectedLead.vendor_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>{selectedLead.vendor_name}</h3>
                                    {!selectedLead.is_admin_chat && (
                                        <span className="event-date">
                                            {t('messages.weddingDate')}: {selectedLead.event_date ? new Date(selectedLead.event_date).toLocaleDateString('tr-TR') : t('messages.notSpecified')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="messages-list">
                            {messages.length === 0 ? (
                                <div className="no-messages">
                                    <p>{t('messages.startMessage') || 'Mesajlaşmaya başlayın...'}</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`message-bubble ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                                    >
                                        <p>{msg.content}</p>
                                        <span className="message-time">
                                            {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="message-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={t('messages.typePlaceholder') || 'Mesajınızı yazın...'}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSendMessage(e);
                                }}
                            />
                            <button type="submit" disabled={!newMessage.trim()}>
                                ➤
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="empty-chat-state">
                        <p>{t('messages.selectConversation') || 'Bir konuşma seçin'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoupleMessages;
