import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminMessaging.css';

const AdminMessaging = () => {
    usePageTitle('Mesajlar - Admin Panel');
    const { user } = useAuth();

    // Core State
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Feature State
    const [isTyping, setIsTyping] = useState(false); // Counterparty is typing
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [cannedResponses, setCannedResponses] = useState([]);
    const [showCannedMenu, setShowCannedMenu] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Refs
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Auto-scroll on new messages (if at bottom) or initial load
    useEffect(() => {
        if (messages.length > 0 && !loadingMessages) {
            scrollToBottom();
        }
    }, [messages.length, selectedConversation?.id]);

    useEffect(() => {
        if (user) {
            fetchConversations();
            fetchCannedResponses();
        }
    }, [user]);

    // Handle URL params
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const urlConversationId = searchParams.get('conversation');

        console.log('🔗 [DeepLink] URL Param ID:', urlConversationId);
        console.log('🔗 [DeepLink] Loaded Conversations:', conversations.length);

        if (urlConversationId && conversations.length > 0) {

            // Log IDs in list to see if we have a match
            // console.log('🔗 [DeepLink] Available IDs:', conversations.map(c => c.id));

            if (selectedConversation?.id !== urlConversationId) {
                // Try finding by Conversation ID OR Counterparty ID
                const target = conversations.find(c => c.id === urlConversationId || c.counterparty_id === urlConversationId);
                console.log('🔗 [DeepLink] Target Found via ID/User:', target);

                if (target) {
                    console.log('🔗 [DeepLink] Setting Selected Conversation');
                    setSelectedConversation(target);
                } else {
                    console.warn('🔗 [DeepLink] Target NOT found in loaded list');
                }
            }
        }
    }, [conversations.length, window.location.search]);

    // Message Fetching & Presence
    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            fetchUserDetails(selectedConversation);

            if (!selectedConversation.is_read) {
                markAsRead(selectedConversation.id);
            }

            // Presence & Realtime
            const channel = supabase.channel(`room_${selectedConversation.id}`);

            channel
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState();
                    // Check if anyone else is typing (simplified)
                    // In a real app, check user IDs. 
                    const others = Object.values(state).flat().filter(u => u.user_id !== user.id);
                    setIsTyping(others.some(u => u.isTyping));
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversation.id}` }, (payload) => {
                    const newMsg = payload.new;
                    setMessages((prev) => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                    if (newMsg.sender_id !== user.id) {
                        markAsRead(selectedConversation.id);
                        setIsTyping(false); // Stop typing indicator if msg received
                    }
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.track({ user_id: user.id, isTyping: false });
                    }
                });

            return () => {
                supabase.removeChannel(channel);
                setIsTyping(false);
            };
        }
    }, [selectedConversation?.id]); // Only re-run if conversation ID changes

    // Canned Responses
    const fetchCannedResponses = async () => {
        try {
            const { data, error } = await supabase.from('canned_responses').select('*').order('title');
            if (!error) setCannedResponses(data || []);
        } catch (err) {
            console.error('Error fetching canned responses:', err);
        }
    };

    const fetchUserDetails = async (conv) => {
        // Mocking user details for now based on conversation data
        // In real implementation you'd fetch from profiles/vendors table if needed detail is missing
        setUserDetails({
            name: conv.contact_name,
            avatar: conv.avatar,
            id: conv.counterparty_id,
            // You could fetch email/phone here if not in conv object
        });
        setShowUserDetails(true);
    };

    const markAsRead = async (conversationId) => {
        try {
            if (!user) return;
            await supabase.rpc('mark_admin_messages_read', { p_conversation_id: conversationId });
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, is_read: true, unread_count: 0 } : c
            ));
        } catch (error) {
            console.error('Error marking read:', error);
        }
    };

    const fetchConversations = async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            // Store results temporarily
            let standardResults = [];
            let legacyResults = [];

            // 1. Fetch Standard Conversations (RPC) - FAST
            // We run this first and update state so user sees something immediately
            const fetchStandard = async () => {
                try {
                    // Use a timeout to prevent hanging if RPC stalls (unlikely but good for UX)
                    const { data, error } = await supabase.rpc('get_support_conversations', { p_status: 'active' });
                    if (error) {
                        console.error('Error fetching standard conversations:', error);
                        return [];
                    }
                    return (data || []).map(c => ({
                        id: c.conversation_id,
                        contact_name: c.contact_name,
                        last_message: c.last_message_content || 'Mesaj yok',
                        created_at: c.updated_at,
                        is_read: c.unread_count === 0,
                        unread_count: c.unread_count,
                        avatar: (c.contact_name || 'U').charAt(0).toUpperCase(),
                        counterparty_id: c.counterparty_id,
                        context: c.message_context,
                        is_legacy: false // Standard chat
                    }));
                } catch (e) {
                    console.error('Standard fetch crash:', e);
                    return [];
                }
            };

            // 2. Fetch Legacy Conversations (Edge Function) - SLOWER
            const fetchLegacy = async () => {
                try {
                    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/list_admin_conversations`, {
                        headers: {
                            'Authorization': `Bearer ${session?.access_token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        return [];
                    }

                    const result = await response.json();
                    return (result.conversations || []).map(c => {
                        let displayName = 'Canlı Destek';
                        if (c.user_profile?.full_name) displayName = c.user_profile.full_name;
                        else if (c.other_user_profile?.business_name) displayName = c.other_user_profile.business_name;
                        else if (c.user_profile?.email) displayName = c.user_profile.email;

                        return {
                            id: c.id,
                            contact_name: displayName,
                            last_message: c.last_message?.content || 'Mesaj yok',
                            created_at: c.last_message_at || c.created_at,
                            is_read: c.unread_count === 0,
                            unread_count: c.unread_count || 0,
                            avatar: displayName.charAt(0).toUpperCase(),
                            counterparty_id: c.user_id,
                            context: 'Legacy Support Chat',
                            is_legacy: true
                        };
                    });
                } catch (e) {
                    console.error('Legacy fetch error:', e);
                    return [];
                }
            };

            // Execution Strategy:
            // 1. Start both
            // 2. When Standard finishes -> update state (user sees UI)
            // 3. When Legacy finishes -> merge and update state again

            // Fire Standard
            const standardPromise = fetchStandard();
            // Fire Legacy
            const legacyPromise = fetchLegacy();

            // Await Standard first (Fastest content)
            standardResults = await standardPromise;

            // Initial render with standard only
            if (showLoader) setLoading(false); // Stop main spinner
            setConversations(standardResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));

            // Await Legacy
            legacyResults = await legacyPromise;

            // Final Merge
            if (legacyResults.length > 0) {
                const allConvs = [...standardResults, ...legacyResults].sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setConversations(allConvs);
            }

        } catch (error) {
            console.error('Error main fetch:', error);
            if (showLoader) setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        setLoadingMessages(true);
        try {
            // Check if this is a legacy conversation
            // We need to look up the conversation object to know if it's legacy
            // passed conversationId is just an ID.
            const isLegacy = conversations.find(c => c.id === conversationId)?.is_legacy;

            if (isLegacy) {
                const { data, error } = await supabase
                    .from('admin_messages')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: false }) // Reverse later
                    .limit(100);

                if (error) throw error;

                // Map legacy messages to standard structure if needed
                // admin_messages: id, conversation_id, sender_id, content, created_at, read_at
                // standard: same mostly.
                const mapped = (data || []).map(m => ({
                    ...m,
                    is_read: !!m.read_at
                }));

                setMessages(mapped.reverse());
            } else {
                const { data, error } = await supabase
                    .rpc('get_admin_messages', { p_conversation_id: conversationId, p_limit: 100, p_offset: 0 });

                if (error) throw error;
                // Reverse because API returns DESC (newest first) but we render ASC (oldest top)
                setMessages((data || []).reverse());
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const archiveConversation = async () => {
        if (!selectedConversation) return;
        if (!window.confirm('Bu konuşmayı arşivlemek istediğinize emin misiniz?')) return;

        try {
            const { error } = await supabase.rpc('archive_conversation', { p_conversation_id: selectedConversation.id });
            if (error) throw error;

            // Remove from list
            setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
            setSelectedConversation(null);
            setMessages([]);
        } catch (err) {
            alert('Arşivleme başarısız: ' + err.message);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const tempId = Date.now();
            const content = newMessage.trim();
            setNewMessage('');
            setShowCannedMenu(false);

            // Optimistic Update
            const optimisticMsg = {
                id: tempId,
                content: content,
                sender_id: user.id,
                created_at: new Date().toISOString(),
                conversation_id: selectedConversation.id
            };
            setMessages(prev => [...prev, optimisticMsg]);
            scrollToBottom();

            if (selectedConversation.is_legacy) {
                // Legacy Chat: Insert directly to admin_messages
                const { data: sentMsg, error: sendError } = await supabase
                    .from('admin_messages')
                    .insert({
                        conversation_id: selectedConversation.id,
                        sender_id: user.id, // Admin is sender
                        receiver_id: selectedConversation.counterparty_id,
                        content: content
                    })
                    .select()
                    .single();

                if (sendError) throw sendError;

                // Create Notification for the User
                try {
                    const { error: notifError } = await supabase.from('user_notifications').insert({
                        user_id: selectedConversation.counterparty_id,
                        type: 'new_message',
                        title: 'new_message', // Will be translated by frontend
                        message: JSON.stringify({
                            key: 'dashboard.notifications.new_message_message',
                            args: { name: 'KolayDugun' }
                        }) + `|||${selectedConversation.id}`
                    });

                    if (notifError) {
                        console.error('❌ [AdminMessaging] Notification Insert Error:', notifError);
                    } else {
                        console.log('✅ [AdminMessaging] Notification inserted successfully');
                    }
                } catch (nErr) {
                    console.error('❌ [AdminMessaging] Notification unexpected error:', nErr);
                }

            } else {
                // Standard Chat: Use RPC
                const { error } = await supabase
                    .rpc('send_admin_message', {
                        p_conversation_id: selectedConversation.id,
                        p_content: content
                    });
                if (error) throw error;

                // Create Notification for the User (Manual Logic for Standard Chat too)
                try {
                    const { error: notifError } = await supabase.from('user_notifications').insert({
                        user_id: selectedConversation.counterparty_id,
                        type: 'new_message',
                        title: 'new_message',
                        message: JSON.stringify({
                            key: 'dashboard.notifications.new_message_message',
                            args: { name: 'KolayDugun' }
                        }) + `|||${selectedConversation.id}`
                    });

                    if (notifError) {
                        console.error('❌ [AdminMessaging] Notification Insert Error (Standard):', notifError);
                    } else {
                        console.log('✅ [AdminMessaging] Notification inserted successfully (Standard)');
                    }
                } catch (nErr) {
                    console.error('❌ [AdminMessaging] Notification unexpected error:', nErr);
                }
            }

            fetchConversations(false); // Refresh list for last message update

        } catch (error) {
            console.error('Error sending:', error);
            alert('Mesaj gönderilemedi.');
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        // Broadcast typing status (throttled)
        if (!typingTimeoutRef.current) {
            const channel = supabase.channel(`room_${selectedConversation.id}`);
            channel.track({ user_id: user.id, isTyping: true });

            typingTimeoutRef.current = setTimeout(() => {
                channel.track({ user_id: user.id, isTyping: false });
                typingTimeoutRef.current = null;
            }, 2000);
        }
    };

    // Date grouping helper
    const groupMessagesByDate = (msgs) => {
        const groups = [];
        let lastDate = null;

        msgs.forEach(msg => {
            const msgDate = new Date(msg.created_at).toLocaleDateString();
            if (msgDate !== lastDate) {
                groups.push({ type: 'separator', date: msgDate, id: `sep-${msg.id}` });
                lastDate = msgDate;
            }
            groups.push({ type: 'message', data: msg, id: msg.id });
        });
        return groups;
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const timeStr = timestamp.endsWith('Z') || timestamp.includes('+') ? timestamp : `${timestamp}Z`;
        const date = new Date(timeStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Şimdi';
        if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
    };

    const formatSeparatorDate = (dateStr) => {
        const date = new Date(dateStr.split('.').reverse().join('-')); // tr-TR format fix assumption or standard Date parse
        // Actually msgDate is locale string. Let's rely on standard
        const today = new Date().toLocaleDateString();

        // Basic check (might depend on locale format 'dd.mm.yyyy')
        if (dateStr === today) return 'Bugün';

        return dateStr;
    };

    const filteredConversations = conversations.filter(c =>
        c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const insertCannedResponse = (content) => {
        setNewMessage(content);
        setShowCannedMenu(false);
    };

    return (
        <div className="admin-content" style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <div className="admin-header">
                <h1>💬 Mesajlar</h1>
                <p>Kullanıcı ve tedarikçi destek talepleri</p>
            </div>

            <div className="admin-messaging-container">
                {/* Sidebar */}
                <div className="am-sidebar">
                    <div className="am-sidebar-header">
                        <h2>Gelen Kutusu</h2>
                        <input
                            type="text"
                            placeholder="İsim ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="am-search-input"
                        />
                    </div>
                    <div className="am-conversations-list">
                        {loading && conversations.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Yükleniyor...</div>
                        ) : filteredConversations.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                {searchTerm ? 'Sonuç bulunamadı' : 'Henüz mesaj yok'}
                            </div>
                        ) : (
                            filteredConversations.map(conv => (
                                <div
                                    key={conv.id}
                                    className={`am-conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                                    onClick={() => setSelectedConversation(conv)}
                                >
                                    <div className="am-avatar">
                                        {conv.avatar}
                                    </div>
                                    <div className="am-conversation-info">
                                        <div className="am-info-top">
                                            <div className="am-name">{conv.contact_name}</div>
                                            <div className="am-time">{formatTime(conv.created_at)}</div>
                                        </div>
                                        <p className="am-preview">
                                            {conv.last_message}
                                        </p>
                                    </div>
                                    {!conv.is_read && <div className="am-unread-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                {selectedConversation ? (
                    <>
                        <div className="am-chat-area">
                            <div className="am-chat-header">
                                <div className="am-avatar" style={{ marginRight: '15px' }}>
                                    {selectedConversation.avatar}
                                </div>
                                <div className="am-header-info">
                                    {selectedConversation.contact_name}
                                </div>
                                <div style={{ flex: 1 }}></div>
                                <button className="am-archive-button" onClick={archiveConversation} title="Arşivle">
                                    📥 Arşivle
                                </button>
                                <button
                                    className="am-archive-button"
                                    style={{ marginLeft: '10px' }}
                                    onClick={() => setShowUserDetails(!showUserDetails)}
                                    title="Detaylar"
                                >
                                    ℹ️
                                </button>
                            </div>

                            <div className="am-messages-feed" ref={messagesContainerRef}>
                                {loadingMessages && <div style={{ textAlign: 'center', padding: '10px', color: '#999' }}>Yükleniyor...</div>}

                                {groupMessagesByDate(messages).map(item => {
                                    if (item.type === 'separator') {
                                        return (
                                            <div key={item.id} className="am-date-separator">
                                                <span>{formatSeparatorDate(item.date)}</span>
                                            </div>
                                        );
                                    }

                                    const msg = item.data;
                                    const isMe = msg.sender_id === user.id;
                                    const isTheirs = !isMe; // Simplified logic

                                    return (
                                        <div key={msg.id} className={`am-message-group ${isMe ? 'mine' : 'theirs'}`}>
                                            <div className="am-bubble">
                                                {msg.content}
                                            </div>
                                            <div className="am-message-time">
                                                {new Date(msg.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {isTyping && (
                                    <div className="am-typing-indicator">
                                        <div className="am-typing-dot"></div>
                                        <div className="am-typing-dot"></div>
                                        <div className="am-typing-dot"></div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="am-input-area" onSubmit={handleSendMessage}>
                                {showCannedMenu && cannedResponses.length > 0 && (
                                    <div className="am-canned-popover">
                                        <div style={{ padding: '10px', background: '#f8f9fa', borderBottom: '1px solid #eaeaea', fontWeight: 600, color: '#666', fontSize: '0.8rem' }}>
                                            Hazır Yanıtlar
                                        </div>
                                        {cannedResponses.map(cr => (
                                            <div key={cr.id} className="am-canned-item" onClick={() => insertCannedResponse(cr.content)}>
                                                <div className="am-canned-title">{cr.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {cr.content}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="am-canned-response-btn"
                                    onClick={() => setShowCannedMenu(!showCannedMenu)}
                                    title="Hazır Yanıtlar"
                                >
                                    ⚡
                                </button>

                                <input
                                    className="am-input-field"
                                    type="text"
                                    placeholder="Mesajınızı yazın..."
                                    value={newMessage}
                                    onChange={handleTyping}
                                />
                                <button type="submit" className="am-send-button" disabled={!newMessage.trim()}>
                                    ➢
                                </button>
                            </form>
                        </div>

                        {/* User Details Sidebar */}
                        {showUserDetails && userDetails && (
                            <div className="am-user-details-sidebar">
                                <div className="am-detail-avatar">
                                    {userDetails.avatar}
                                </div>
                                <div className="am-detail-name">
                                    {userDetails.name}
                                </div>
                                <div className="am-detail-role">
                                    Kullanıcı / Tedarikçi
                                </div>

                                <div className="am-detail-section">
                                    <div className="am-detail-label">ID</div>
                                    <div className="am-detail-value" style={{ fontSize: '0.8rem' }}>{userDetails.id}</div>
                                </div>

                                {selectedConversation.context && (
                                    <div className="am-detail-section">
                                        <div className="am-detail-label">Konu / Bağlam</div>
                                        <div className="am-detail-value">{selectedConversation.context}</div>
                                    </div>
                                )}

                                <div className="am-detail-section" style={{ marginTop: 'auto' }}>
                                    <button
                                        className="am-archive-button"
                                        style={{ width: '100%', justifyContent: 'center', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                                        onClick={() => setShowUserDetails(false)}
                                    >
                                        Paneli Kapat
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="am-empty-state">
                        <div className="am-empty-icon">💬</div>
                        <div className="am-empty-text">Görüntülemek için bir konuşma seçin</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessaging;
