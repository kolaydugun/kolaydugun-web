import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const RelatedPosts = ({ postId, lang = 'tr', limit = 3 }) => {
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRelatedPosts();
    }, [postId]);

    const fetchRelatedPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_related_posts', {
            p_post_id: postId,
            p_limit: limit
        });

        if (!error) setRelatedPosts(data || []);
        setLoading(false);
    };

    if (loading || relatedPosts.length === 0) return null;

    return (
        <div className="related-posts" style={{ marginTop: '60px', paddingTop: '40px', borderTop: '2px solid #eee' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px' }}>
                🔗 {lang === 'tr' ? 'İlgili Yazılar' : lang === 'de' ? 'Verwandte Artikel' : 'Related Posts'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {relatedPosts.map(post => {
                    const title = post.title?.[lang] || post.title?.tr || 'Untitled';
                    const excerpt = post.excerpt?.[lang] || post.excerpt?.tr || '';

                    return (
                        <Link
                            key={post.id}
                            to={`/blog/${post.slug}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{
                                background: '#fff',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                cursor: 'pointer',
                                height: '100%'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                                }}
                            >
                                {post.featured_image_url && (
                                    <div style={{ position: 'relative', paddingTop: '60%', overflow: 'hidden' }}>
                                        <img
                                            src={post.featured_image_url}
                                            alt={title}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                )}
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', lineHeight: '1.4' }}>
                                        {title}
                                    </h3>
                                    {excerpt && (
                                        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5', marginBottom: '10px' }}>
                                            {excerpt.substring(0, 100)}...
                                        </p>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#888' }}>
                                        {post.reading_time && <span>⏱️ {post.reading_time} {lang === 'tr' ? 'dk' : 'min'}</span>}
                                        {post.view_count > 0 && <span>👁️ {post.view_count.toLocaleString()}</span>}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default RelatedPosts;
