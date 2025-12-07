import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const CommentSection = ({ postId, lang = 'tr' }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        author_name: '',
        author_email: '',
        content: ''
    });

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blog_comments')
            .select('*')
            .eq('post_id', postId)
            .eq('status', 'approved')
            .is('parent_id', null)
            .order('created_at', { ascending: false });

        if (!error) setComments(data || []);
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.author_name || !formData.author_email || !formData.content) {
            alert(lang === 'tr' ? 'Lütfen tüm alanları doldurun' : 'Please fill all fields');
            return;
        }

        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('blog_comments')
                .insert([{
                    post_id: postId,
                    user_id: user?.id || null,
                    author_name: formData.author_name,
                    author_email: formData.author_email,
                    content: formData.content,
                    status: 'pending' // Will be moderated
                }]);

            if (error) throw error;

            alert(lang === 'tr'
                ? '✅ Yorumunuz gönderildi! Onaylandıktan sonra görünecektir.'
                : '✅ Comment submitted! It will appear after approval.');

            setFormData({ author_name: '', author_email: '', content: '' });
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert(lang === 'tr' ? 'Hata: ' + error.message : 'Error: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString(lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="comment-section" style={{ marginTop: '60px', borderTop: '2px solid #eee', paddingTop: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px' }}>
                💬 {lang === 'tr' ? 'Yorumlar' : lang === 'de' ? 'Kommentare' : 'Comments'} ({comments.length})
            </h2>

            {/* Comment Form */}
            <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '12px', marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px' }}>
                    {lang === 'tr' ? 'Yorum Yap' : lang === 'de' ? 'Kommentar schreiben' : 'Leave a Comment'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <input
                            type="text"
                            placeholder={lang === 'tr' ? 'Adınız' : lang === 'de' ? 'Ihr Name' : 'Your Name'}
                            value={formData.author_name}
                            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                            style={{
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '16px'
                            }}
                            required
                        />
                        <input
                            type="email"
                            placeholder={lang === 'tr' ? 'E-posta' : lang === 'de' ? 'E-Mail' : 'Email'}
                            value={formData.author_email}
                            onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                            style={{
                                padding: '12px 16px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '16px'
                            }}
                            required
                        />
                    </div>
                    <textarea
                        placeholder={lang === 'tr' ? 'Yorumunuz...' : lang === 'de' ? 'Ihr Kommentar...' : 'Your comment...'}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            marginBottom: '15px',
                            resize: 'vertical'
                        }}
                        required
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            padding: '12px 24px',
                            background: submitting ? '#9ca3af' : '#d63638',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting
                            ? (lang === 'tr' ? 'Gönderiliyor...' : 'Sending...')
                            : (lang === 'tr' ? 'Yorum Gönder' : lang === 'de' ? 'Kommentar senden' : 'Post Comment')}
                    </button>
                </form>
            </div>

            {/* Comments List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-spinner"></div>
                </div>
            ) : comments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p>{lang === 'tr' ? 'Henüz yorum yok. İlk yorumu siz yapın!' : 'No comments yet. Be the first to comment!'}</p>
                </div>
            ) : (
                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment.id} style={{
                            background: '#fff',
                            padding: '24px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div>
                                    <strong style={{ fontSize: '1.1rem', color: '#1a1a1a' }}>{comment.author_name}</strong>
                                    <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>
                                        {formatDate(comment.created_at)}
                                    </p>
                                </div>
                            </div>
                            <p style={{ fontSize: '1rem', lineHeight: '1.6', color: '#333' }}>
                                {comment.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentSection;
