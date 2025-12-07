import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../supabaseClient';
import './VendorMessages.css';

import AdminMessaging from './AdminMessaging';

const VendorMessages = ({ vendor }) => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialView = searchParams.get('support') === 'true' ? 'admin' : 'leads';

    const [activeView, setActiveView] = useState(initialView); // 'leads' or 'admin'
    const [conversations, setConversations] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Fetch conversations
    useEffect(() => {
        if (!vendor?.id) return;
        fetchConversations();
    }, [vendor, t]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const { data: conversationsData, error: convError } = await supabase
                .from('conversations')
                .select(`
                    id,
                    lead_id,
                    user_id,
                    updated_at,
                    lead: leads(*)
                `)
                .eq('vendor_id', vendor.id)
                .order('updated_at', { ascending: false });

            if (convError) {
                console.error('Error fetching conversations:', convError);
            } else {
                // Enrich with profile names if lead name is generic/missing
                const enrichedConversations = await Promise.all(conversationsData.map(async (c) => {
                    let leadData = null;

                    if (c.lead) {
                        leadData = {
                            ...c.lead,
                            conversation_id: c.id,
                            is_support: false,
                            // Ensure display name is robust
                            display_name: c.lead.contact_name || c.lead.event_type || 'Misafir',
                            display_date: c.lead.event_date ? new Date(c.lead.event_date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US') : ''
                        };

                        // If contact name is missing but we have user_id, fetch profile
                        if ((!c.lead.contact_name || c.lead.contact_name === 'Yeni Talep') && c.user_id) {
                            const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', c.user_id).single();
                            if (profile?.full_name) {
                                leadData.display_name = profile.full_name;
                                leadData.contact_name = profile.full_name;
                            }
                        }
                    } else if (!c.lead_id) {
                        // Support or Direct Message
                        let displayName = t('dashboard.supportVendorName') || 'KolayDugun Destek';
                        let isSupport = true;

                        // Check if it's a direct user message (not support, not lead) - unlikely but possible
                        // If user_id exists, try to get name
                        if (c.user_id) {
                            const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', c.user_id).single();
                            if (profile) {
                                if (profile.role !== 'admin' && profile.role !== 'support') {
                                    displayName = profile.full_name || 'Kullanıcı';
                                    isSupport = false;
                                }
                            }
                        }

                        leadData = {
                            id: 'direct-' + c.id,
                            lead_id: null,
                            conversation_id: c.id,
                            contact_name: displayName,
                            display_name: displayName,
                            created_at: c.updated_at,
                            vendor_status: isSupport ? 'support' : 'active',
                            user_id: c.user_id,
                            is_support: isSupport,
                            subtitle: new Date(c.updated_at).toLocaleDateString()
                        };
                    }
                    return leadData;
                }));

                const validLeads = enrichedConversations.filter(Boolean);
                setConversations(validLeads);

                // If selected lead exists, update it with new data
                if (selectedLead) {
                    const updated = validLeads.find(l => l.conversation_id === selectedLead.conversation_id);
                    if (updated) setSelectedLead(updated);
                }
            }
        } catch (error) {
            console.error('Error in fetchConversations:', error);
        } finally {
            setLoading(false);
        }
    };

    // Deep linking logic
    useEffect(() => {
        const conversationId = searchParams.get('conversation');
        if (conversationId && conversations.length > 0) {
            const target = conversations.find(c => c.conversation_id === conversationId);
            if (target && target.conversation_id !== selectedLead?.conversation_id) {
                setSelectedLead(target);
            }
        }
    }, [conversations, searchParams]);

    // Message Fetching
    useEffect(() => {
        if (!selectedLead) return;
        fetchMessages();

        if (!selectedLead.conversation_id) return;

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
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [selectedLead]);

    // Force scroll on new messages
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, selectedLead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const fetchMessages = async () => {
        try {
            if (!selectedLead.conversation_id) {
                setMessages([]);
                return;
            }

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', selectedLead.conversation_id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedLead) return;

        const tempId = Date.now();
        const content = newMessage.trim();
        setNewMessage('');

        // Optimistic UI
        const optimisticMsg = {
            id: tempId,
            conversation_id: selectedLead.conversation_id,
            sender_id: user.id,
            content: content,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        try {
            let conversationId = selectedLead.conversation_id;

            // Create conversation if needed
            if (!conversationId) {
                const { data: newConv, error: createError } = await supabase
                    .from('conversations')
                    .insert({
                        vendor_id: vendor.id,
                        user_id: selectedLead.user_id,
                        lead_id: selectedLead.id
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                conversationId = newConv.id;
                setSelectedLead(prev => ({ ...prev, conversation_id: conversationId }));
            }

            // Send
            const { data: messageData, error: messageError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content: content
                })
                .select()
                .single();

            if (messageError) throw messageError;

            // Update updated_at
            await supabase.from('conversations')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', conversationId);

            setMessages(prev => prev.map(m => m.id === tempId ? messageData : m));
            createNotification(selectedLead.user_id, conversationId, messageData.id, content);

        } catch (error) {
            console.error('Error sending:', error);
            alert('Mesaj gönderilemedi.');
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Revert
        }
    };

    const createNotification = async (targetUserId, convId, msgId, content) => {
        try {
            const noteTitle = `Yeni mesaj: ${vendor.business_name}`;
            await supabase.from('user_notifications').insert({
                user_id: targetUserId,
                type: 'new_message',
                title: noteTitle,
                message: content.substring(0, 100),
                related_conversation_id: convId,
                related_message_id: msgId,
                is_read: false
            });
        } catch (e) {
            console.warn('Note creation failed', e);
        }
    };

    // Quick Replies Buttons
    const QuickReplyButton = ({ text, subtext, color, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            style={{
                padding: '8px 16px',
                background: '#fff',
                border: `1px solid ${color}`,
                borderRadius: '20px',
                color: color,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 600
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = color;
                e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = color;
            }}
        >
            {subtext}
        </button>
    );

    if (activeView === 'admin') {
        return <AdminMessaging onBack={() => setActiveView('leads')} />;
    }

    return (
        <div className="vendor-messages-container">
            {/* Sidebar */}
            <div className="conversations-sidebar">
                <div className="sidebar-header-actions">
                    <h3>{t('dashboard.inquiries') || 'Mesajlar'}</h3>
                    <button className="contact-admin-btn" onClick={() => setActiveView('admin')}>
                        👨‍💼 {t('dashboard.contactAdmin')}
                    </button>
                </div>

                <div className="conversations-list">
                    {conversations.map(lead => (
                        <div
                            key={lead.id}
                            className={`conversation-item ${selectedLead?.id === lead.id ? 'active' : ''}`}
                            onClick={() => setSelectedLead(lead)}
                        >
                            <div className="conversation-avatar">
                                {(lead.display_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="conversation-info">
                                <div className="info-row">
                                    <h4 className="conversation-name">
                                        {lead.display_name}
                                        {lead.is_support && <span className="support-tag">Destek</span>}
                                    </h4>
                                    {(!lead.vendor_status || lead.vendor_status === 'new') && (
                                        <span className="status-badge new">Yeni</span>
                                    )}
                                </div>
                                <div className="info-row">
                                    <span className="conversation-date">
                                        {new Date(lead.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && !loading && (
                        <div className="no-conversations-hint">
                            {t('dashboard.noLeadsYet')}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
                {selectedLead ? (
                    <>
                        <div className="chat-header">
                            <div className="header-info">
                                <h3>{selectedLead.display_name}</h3>
                                {selectedLead.display_date && (
                                    <span className="subtitle">📅 Düğün Tarihi: {selectedLead.display_date}</span>
                                )}
                                {selectedLead.is_support && <span className="subtitle">Destek Talebi</span>}
                            </div>
                        </div>

                        <div className="messages-list" ref={scrollContainerRef}>
                            {messages.length === 0 ? (
                                <div className="no-messages">
                                    <div className="empty-state-icon">👋</div>
                                    <p>Sohbeti başlatın</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.sender_id === user.id;
                                    return (
                                        <div key={msg.id} className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                            <div className="message-content">{msg.content}</div>
                                            <span className="message-time">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Replies */}
                        <div className="quick-replies-container">
                            <QuickReplyButton
                                text="İnceliyorum"
                                subtext={language === 'en' ? '📝 Reviewing' : '📝 İnceliyorum'}
                                color="#2196f3"
                                onClick={() => setNewMessage('Teşekkürler, talebinizi inceliyorum. En kısa sürede size dönüş yapacağım.')}
                            />
                            <QuickReplyButton
                                text="Teklif"
                                subtext={language === 'en' ? '💰 Quote' : '💰 Teklif Hazırlıyorum'}
                                color="#4caf50"
                                onClick={() => setNewMessage('Merhaba! Fiyat teklifimi hazırlıyorum. Kısa süre içinde detaylı bilgi göndereceğim.')}
                            />
                            <QuickReplyButton
                                text="Müsaitlik"
                                subtext={language === 'en' ? '📅 Check' : '📅 Müsaitlik Kontrolü'}
                                color="#ff9800"
                                onClick={() => setNewMessage('Tarih için müsaitlik durumumu kontrol ediyorum. Size en kısa sürede bilgi vereceğim.')}
                            />
                            <QuickReplyButton
                                text="Arama"
                                subtext={language === 'en' ? '📞 Call' : '📞 Görüşme Talebi'}
                                color="#9c27b0"
                                onClick={() => setNewMessage('Detayları konuşmak için kısa bir telefon görüşmesi yapabilir miyiz? Size ne zaman uygun olur?')}
                            />
                        </div>

                        <form className="message-input-area" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder={t('messages.typePlaceholder')}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="message-input"
                            />
                            <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                                ➤
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="empty-chat-state">
                        <div className="placeholder-icon">💬</div>
                        <p>{t('dashboard.selectConversation') || 'Bir konuşma seçin'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorMessages;
