import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import SEO from '../components/SEO';
import CommentSection from '../components/CommentSection';
import RelatedPosts from '../components/RelatedPosts';
import ShareButtons from '../components/ShareButtons';
import './AdminConfig.css'; // Reusing some styles

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();

    // Get current language code (tr, en, de)
    const currentLang = i18n.language ? i18n.language.split('-')[0] : 'tr';

    useEffect(() => {
        fetchPost();
    }, [slug]);

    useEffect(() => {
        // Track view after post is loaded
        if (post?.id) {
            trackView();
        }
    }, [post?.id]);

    const fetchPost = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.error('Error fetching post:', error);
        } else {
            setPost(data);
        }
        setLoading(false);
    };

    const trackView = async () => {
        if (!post?.id) return;

        try {
            // Get user's IP (simplified - in production use a proper service)
            const ipAddress = 'anonymous'; // You can use a service like ipapi.co

            await supabase.rpc('track_post_view', {
                p_post_id: post.id,
                p_user_id: null, // Can be set if user is logged in
                p_ip_address: ipAddress
            });
        } catch (error) {
            console.error('Error tracking view:', error);
        }
    };



    if (loading) return (
        <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
        </div>
    );

    if (!post) return (
        <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
            <h1>Yazı Bulunamadı</h1>
            <Link to="/blog" className="btn btn-primary">Blog'a Dön</Link>
        </div>
    );

    const title = post.title?.[currentLang] || post.title?.['tr'] || post.title?.['en'];
    let content = post.content?.[currentLang] || post.content?.['tr'] || post.content?.['en'];

    // Clean up unreplaced slots (e.g. {{SLOT_1}})
    if (content) {
        content = content.replace(/{{SLOT_[^}]+}}/g, '');
    }
    const date = new Date(post.created_at).toLocaleString(currentLang === 'tr' ? 'tr-TR' : currentLang === 'de' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Structured Data for Blog Post
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "image": post.featured_image_url ? [post.featured_image_url] : [],
        "datePublished": post.created_at,
        "dateModified": post.updated_at || post.created_at,
        "author": {
            "@type": "Organization",
            "name": "KolayDugun Editorial Team",
            "url": "https://kolaydugun.de"
        },
        "publisher": {
            "@type": "Organization",
            "name": "KolayDugun",
            "logo": {
                "@type": "ImageObject",
                "url": "https://kolaydugun.de/logo.png"
            }
        },
        "description": post.excerpt || title
    };

    return (
        <div className="blog-post-page" style={{ background: '#fff', minHeight: '100vh', paddingBottom: '80px' }}>
            <SEO
                title={title}
                description={post.excerpt || title}
                image={post.featured_image_url}
                url={`/blog/${slug}`}
                type="article"
                structuredData={structuredData}
            />
            {/* Hero / Cover Image */}
            <div className="blog-post-hero" style={{
                height: '60vh',
                maxHeight: '500px',
                position: 'relative',
                background: '#f0f0f0',
                overflow: 'hidden'
            }}>
                <img
                    src={post.featured_image_url || 'https://via.placeholder.com/1200x600?text=No+Image'}
                    alt={title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))'
                }}></div>

                <div className="container" style={{
                    position: 'absolute',
                    bottom: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: '#fff',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '800px',
                    padding: '0 20px'
                }}>
                    <div className="post-meta" style={{ marginBottom: '15px', opacity: 0.9, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <span>📅 {date}</span>
                        {post.reading_time && (
                            <span>⏱️ {post.reading_time} {currentLang === 'tr' ? 'dakika' : currentLang === 'de' ? 'Minuten' : 'min'}</span>
                        )}
                        {post.view_count > 0 && (
                            <span>👁️ {post.view_count.toLocaleString()} {currentLang === 'tr' ? 'görüntülenme' : currentLang === 'de' ? 'Ansichten' : 'views'}</span>
                        )}
                    </div>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        lineHeight: '1.2',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        marginBottom: '0'
                    }}>
                        {title}
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ maxWidth: '800px', marginTop: '60px' }}>
                <div className="blog-content-body" style={{
                    fontSize: '1.15rem',
                    lineHeight: '1.8',
                    color: '#333'
                }}>
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>

                {/* Share Buttons */}
                <ShareButtons
                    url={`${window.location.origin}/blog/${post.slug}`}
                    title={title}
                    lang={currentLang}
                />

                {/* Related Posts */}
                <RelatedPosts postId={post.id} lang={currentLang} />

                {/* Comments Section */}
                {post.comments_enabled !== false && (
                    <CommentSection postId={post.id} lang={currentLang} />
                )}

                {/* Back Button */}
                <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '40px', textAlign: 'center' }}>
                    <Link to="/blog" className="btn btn-outline" style={{ color: '#333', borderColor: '#ddd' }}>
                        ← {currentLang === 'tr' ? 'Tüm Yazılar' : currentLang === 'de' ? 'Alle Artikel' : 'All Posts'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
