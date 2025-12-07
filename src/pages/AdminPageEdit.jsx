import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './AdminPages.css';

const AdminPageEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        slug: '',
        is_active: true,
        title: { en: '', de: '', tr: '' },
        content: { en: '', de: '', tr: '' }
    });

    useEffect(() => {
        if (!isNew) {
            fetchPage();
        }
    }, [id]);

    const fetchPage = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    slug: data.slug,
                    is_active: data.is_active,
                    title: data.title || { en: '', de: '', tr: '' },
                    content: data.content || { en: '', de: '', tr: '' }
                });
            }
        } catch (error) {
            console.error('Error fetching page:', error);
            alert('Error loading page data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value, lang = null) => {
        if (lang) {
            setFormData(prev => ({
                ...prev,
                [field]: {
                    ...prev[field],
                    [lang]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const pageData = {
                slug: formData.slug,
                is_active: formData.is_active,
                title: formData.title,
                content: formData.content,
                updated_at: new Date().toISOString()
            };

            let error;
            if (isNew) {
                const { error: insertError } = await supabase
                    .from('pages')
                    .insert([pageData]);
                error = insertError;
            } else {
                const { error: updateError } = await supabase
                    .from('pages')
                    .update(pageData)
                    .eq('id', id);
                error = updateError;
            }

            if (error) throw error;
            navigate('/admin/pages');
        } catch (error) {
            console.error('Error saving page:', error);
            alert('Error saving page: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isNew && !formData.slug) return <div className="p-4">Loading...</div>;

    return (
        <div className="admin-pages-container">
            <div className="admin-header">
                <h1>{isNew ? 'Create New Page' : 'Edit Page'}</h1>
                <button onClick={() => navigate('/admin/pages')} className="btn btn-secondary">
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="page-edit-form">
                <div className="form-section">
                    <h3>General Settings</h3>
                    <div className="form-group">
                        <label>Slug (URL Path)</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => handleChange('slug', e.target.value)}
                            placeholder="e.g., about-us"
                            required
                            className="form-control"
                        />
                        <small>Page will be accessible at /p/{formData.slug}</small>
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.checked)}
                            />
                            Active (Visible to public)
                        </label>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Content</h3>
                    <div className="tabs">
                        {['en', 'de', 'tr'].map(lang => (
                            <div key={lang} className="lang-section">
                                <h4>{lang.toUpperCase()}</h4>
                                <div className="form-group">
                                    <label>Title ({lang.toUpperCase()})</label>
                                    <input
                                        type="text"
                                        value={formData.title[lang]}
                                        onChange={(e) => handleChange('title', e.target.value, lang)}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Content ({lang.toUpperCase()}) - HTML Supported</label>
                                    <textarea
                                        value={formData.content[lang]}
                                        onChange={(e) => handleChange('content', e.target.value, lang)}
                                        rows="10"
                                        className="form-control font-mono"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Page'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPageEdit;
