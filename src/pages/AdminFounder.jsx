import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { Save, Plus, Trash2, Video, FileText, Image as ImageIcon, Eye, EyeOff, Youtube, Layout } from 'lucide-react';
import './AdminFounder.css';

const AdminFounder = () => {
    const { t } = useLanguage();
    usePageTitle('Kurucu Yönetimi');

    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);

    // Data States
    const [settings, setSettings] = useState({
        bio_tr: '', bio_de: '', bio_en: '',
        photo_url: '',
        social_links: { linkedin: '', youtube: '', instagram: '' },
        is_active: true
    });
    const [projects, setProjects] = useState([]);
    const [media, setMedia] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: sData } = await supabase.from('founder_settings').select('*').single();
        if (sData) setSettings(sData);

        const { data: pData } = await supabase.from('founder_projects').select('*').order('order_index', { ascending: true });
        if (pData) setProjects(pData);

        const { data: mData } = await supabase.from('founder_media').select('*').order('order_index', { ascending: true });
        if (mData) setMedia(mData);

        setLoading(false);
    };

    const ensureHttps = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        // Normalize URLs before saving
        const normalizedSettings = {
            ...settings,
            social_links: {
                linkedin: ensureHttps(settings.social_links.linkedin),
                youtube: ensureHttps(settings.social_links.youtube),
                instagram: ensureHttps(settings.social_links.instagram)
            }
        };
        const { error } = await supabase.from('founder_settings').upsert(normalizedSettings);
        if (error) alert(error.message);
        else {
            alert('Genel bilgiler güncellendi!');
            setSettings(normalizedSettings);
        }
        setLoading(false);
    };

    const handleAddProject = async () => {
        const newProj = {
            title_tr: 'Yeni Proje',
            status: 'future',
            order_index: projects.length + 1
        };
        const { data, error } = await supabase.from('founder_projects').insert(newProj).select().single();
        if (data) setProjects([...projects, data]);
    };

    const handleUpdateProject = async (id, updates) => {
        const { error } = await supabase.from('founder_projects').update(updates).eq('id', id);
        if (!error) setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const handleDeleteProject = async (id) => {
        const { error } = await supabase.from('founder_projects').delete().eq('id', id);
        if (!error) setProjects(projects.filter(p => p.id !== id));
    };

    const handleAddMedia = async () => {
        const newItem = {
            type: 'youtube',
            media_format: 'regular',
            title_tr: 'Yeni Medya',
            url: '',
            order_index: media.length + 1
        };
        const { data, error } = await supabase.from('founder_media').insert(newItem).select().single();
        if (data) setMedia([...media, data]);
    };

    const handleUpdateMedia = async (id, updates) => {
        const { error } = await supabase.from('founder_media').update(updates).eq('id', id);
        if (!error) setMedia(media.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const handleDeleteMedia = async (id) => {
        const { error } = await supabase.from('founder_media').delete().eq('id', id);
        if (!error) setMedia(media.filter(m => m.id !== id));
    };

    return (
        <div className="section container admin-founder-container">
            <div className="admin-header">
                <h1>Kurucu ve Vizyon Yönetimi</h1>
                <p>Gelecek projeler, videolar ve biyografi yönetimi.</p>
            </div>

            <div className="founder-tabs">
                <button className={`founder-tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
                    <FileText size={18} /> Genel Bilgiler
                </button>
                <button className={`founder-tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>
                    <Layout size={18} /> Yol Haritası (Roadmap)
                </button>
                <button className={`founder-tab-btn ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
                    <Video size={18} /> Medya & YouTube
                </button>
            </div>

            {activeTab === 'general' && (
                <div className="founder-form-card">
                    <h3>Profil ve Biyografi</h3>
                    <div className="form-group">
                        <label>Fotoğraf URL</label>
                        <input type="text" value={settings.photo_url} onChange={e => setSettings({ ...settings, photo_url: e.target.value })} />
                    </div>
                    <div className="lang-inputs">
                        <div className="form-group">
                            <label>Hakkımda (TR)</label>
                            <textarea rows="5" value={settings.bio_tr} onChange={e => setSettings({ ...settings, bio_tr: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Hakkımda (DE)</label>
                            <textarea rows="5" value={settings.bio_de} onChange={e => setSettings({ ...settings, bio_de: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Hakkımda (EN)</label>
                            <textarea rows="5" value={settings.bio_en} onChange={e => setSettings({ ...settings, bio_en: e.target.value })} />
                        </div>
                    </div>
                    <div className="lang-inputs">
                        <div className="form-group">
                            <label>LinkedIn</label>
                            <input type="text" value={settings.social_links.linkedin} onChange={e => setSettings({ ...settings, social_links: { ...settings.social_links, linkedin: e.target.value } })} />
                        </div>
                        <div className="form-group">
                            <label>YouTube Kanalı</label>
                            <input type="text" value={settings.social_links.youtube} onChange={e => setSettings({ ...settings, social_links: { ...settings.social_links, youtube: e.target.value } })} />
                        </div>
                        <div className="form-group">
                            <label>Instagram</label>
                            <input type="text" value={settings.social_links.instagram} onChange={e => setSettings({ ...settings, social_links: { ...settings.social_links, instagram: e.target.value } })} />
                        </div>
                    </div>
                    <button className="btn-save" onClick={handleSaveSettings} disabled={loading}> Bilgileri Kaydet </button>
                </div>
            )}

            {activeTab === 'roadmap' && (
                <div className="roadmap-manager">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>Gelecek Projeler / Yol Haritası</h3>
                        <button className="btn btn-primary" onClick={handleAddProject}><Plus size={16} /> Proje Ekle</button>
                    </div>
                    {projects.map(p => (
                        <div key={p.id} className="founder-form-card">
                            <div className="lang-inputs">
                                <input placeholder="Başlık (TR)" value={p.title_tr} onChange={e => handleUpdateProject(p.id, { title_tr: e.target.value })} />
                                <select value={p.status} onChange={e => handleUpdateProject(p.id, { status: e.target.value })}>
                                    <option value="past">Geçmiş Başarı</option>
                                    <option value="current">Şu An Yapılan</option>
                                    <option value="future">Gelecek Hedef</option>
                                </select>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button onClick={() => handleUpdateProject(p.id, { is_active: !p.is_active })}>
                                        {p.is_active ? <Eye /> : <EyeOff />}
                                    </button>
                                    <button onClick={() => handleDeleteProject(p.id)} className="text-danger"><Trash2 /></button>
                                </div>
                            </div>
                            <textarea style={{ marginTop: '10px' }} placeholder="Açıklama (TR)" value={p.description_tr} onChange={e => handleUpdateProject(p.id, { description_tr: e.target.value })} />
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'media' && (
                <div className="media-manager">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>YouTube Videoları & Basın</h3>
                        <button className="btn btn-primary" onClick={handleAddMedia}><Plus size={16} /> Medya Ekle</button>
                    </div>
                    <div className="media-grid">
                        {media.map(m => (
                            <div key={m.id} className="media-item-card">
                                {m.thumbnail_url && <img src={m.thumbnail_url} className="media-thumb" alt="preview" />}
                                <div className="media-info">
                                    <input placeholder="Başlık" value={m.title_tr} onChange={e => handleUpdateMedia(m.id, { title_tr: e.target.value })} />
                                    <input placeholder="URL" value={m.url} onChange={e => handleUpdateMedia(m.id, { url: e.target.value })} />
                                    <div className="lang-inputs" style={{ marginTop: '10px' }}>
                                        <select value={m.type} onChange={e => handleUpdateMedia(m.id, { type: e.target.value })}>
                                            <option value="youtube">YouTube</option>
                                            <option value="press">Basın</option>
                                        </select>
                                        <select value={m.media_format} onChange={e => handleUpdateMedia(m.id, { media_format: e.target.value })}>
                                            <option value="regular">16:9 (Normal)</option>
                                            <option value="short">9:16 (Shorts)</option>
                                        </select>
                                    </div>
                                    <input style={{ marginTop: '10px' }} placeholder="Kategori (TR) Örn: Eğitim" value={m.category_tr} onChange={e => handleUpdateMedia(m.id, { category_tr: e.target.value })} />
                                </div>
                                <div className="media-actions">
                                    <button onClick={() => handleUpdateMedia(m.id, { is_active: !m.is_active })}>
                                        {m.is_active ? <><Eye size={16} /> Aktif</> : <><EyeOff size={16} /> Gizli</>}
                                    </button>
                                    <button onClick={() => handleDeleteMedia(m.id)} className="text-danger"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFounder;
