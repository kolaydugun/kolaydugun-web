import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';
import './AdminFAQ.css';

const AdminFAQ = () => {
    usePageTitle('FAQ Yönetimi');

    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [editingFaq, setEditingFaq] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        category: 'general',
        question_tr: '',
        question_en: '',
        question_de: '',
        answer_tr: '',
        answer_en: '',
        answer_de: '',
        display_order: 0,
        is_active: true
    });

    const categories = [
        { value: 'all', label: 'Tümü', icon: '📋' },
        { value: 'general', label: 'Genel Sorular', icon: '❓' },
        { value: 'couples', label: 'Çiftler İçin', icon: '👰' },
        { value: 'vendors', label: 'Tedarikçiler İçin', icon: '🏢' },
        { value: 'payment', label: 'Ödeme & Fiyatlandırma', icon: '💳' },
        { value: 'technical', label: 'Teknik Destek', icon: '🔧' }
    ];

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('site_faqs')
                .select('*')
                .order('category', { ascending: true })
                .order('display_order', { ascending: true });

            if (error) throw error;
            setFaqs(data || []);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            alert('FAQ\'ler yüklenirken hata oluştu: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingFaq) {
                // Update existing FAQ
                const { error } = await supabase
                    .from('site_faqs')
                    .update(formData)
                    .eq('id', editingFaq.id);

                if (error) throw error;
                alert('✅ FAQ başarıyla güncellendi!');
            } else {
                // Create new FAQ
                const { error } = await supabase
                    .from('site_faqs')
                    .insert([formData]);

                if (error) throw error;
                alert('✅ Yeni FAQ başarıyla eklendi!');
            }

            resetForm();
            fetchFAQs();
        } catch (error) {
            console.error('Error saving FAQ:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleEdit = (faq) => {
        setEditingFaq(faq);
        setFormData({
            category: faq.category,
            question_tr: faq.question_tr,
            question_en: faq.question_en,
            question_de: faq.question_de,
            answer_tr: faq.answer_tr,
            answer_en: faq.answer_en,
            answer_de: faq.answer_de,
            display_order: faq.display_order,
            is_active: faq.is_active
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu FAQ\'yi silmek istediğinizden emin misiniz?')) return;

        try {
            const { error } = await supabase
                .from('site_faqs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            alert('✅ FAQ silindi!');
            fetchFAQs();
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            alert('Hata: ' + error.message);
        }
    };

    const handleToggleActive = async (faq) => {
        try {
            const { error } = await supabase
                .from('site_faqs')
                .update({ is_active: !faq.is_active })
                .eq('id', faq.id);

            if (error) throw error;
            fetchFAQs();
        } catch (error) {
            console.error('Error toggling FAQ:', error);
            alert('Hata: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            category: 'general',
            question_tr: '',
            question_en: '',
            question_de: '',
            answer_tr: '',
            answer_en: '',
            answer_de: '',
            display_order: 0,
            is_active: true
        });
        setEditingFaq(null);
        setShowAddModal(false);
    };

    const filteredFaqs = selectedCategory === 'all'
        ? faqs
        : faqs.filter(faq => faq.category === selectedCategory);

    const getCategoryStats = () => {
        const stats = {};
        categories.forEach(cat => {
            if (cat.value === 'all') {
                stats[cat.value] = faqs.filter(f => f.is_active).length;
            } else {
                stats[cat.value] = faqs.filter(f => f.category === cat.value && f.is_active).length;
            }
        });
        return stats;
    };

    const stats = getCategoryStats();

    if (loading) {
        return (
            <div className="section container" style={{ marginTop: '100px', textAlign: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="section container admin-faq-container">
            <div className="admin-faq-header">
                <div>
                    <h1>📋 Sıkça Sorulan Sorular Yönetimi</h1>
                    <p>Platform FAQ'lerini yönetin, düzenleyin ve yeni sorular ekleyin</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                >
                    ➕ Yeni FAQ Ekle
                </button>
            </div>

            {/* Category Filter */}
            <div className="faq-category-filter">
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.value)}
                    >
                        <span className="cat-icon">{cat.icon}</span>
                        <span className="cat-label">{cat.label}</span>
                        <span className="cat-count">{stats[cat.value] || 0}</span>
                    </button>
                ))}
            </div>

            {/* FAQ List */}
            <div className="faq-list">
                {filteredFaqs.length === 0 ? (
                    <div className="empty-state">
                        <p>Bu kategoride FAQ bulunmuyor.</p>
                    </div>
                ) : (
                    filteredFaqs.map(faq => (
                        <div key={faq.id} className={`faq-item ${!faq.is_active ? 'inactive' : ''}`}>
                            <div className="faq-item-header">
                                <div className="faq-item-info">
                                    <span className="faq-category-badge">
                                        {categories.find(c => c.value === faq.category)?.icon} {categories.find(c => c.value === faq.category)?.label}
                                    </span>
                                    <span className="faq-order">Sıra: {faq.display_order}</span>
                                </div>
                                <div className="faq-item-actions">
                                    <button
                                        className={`btn-toggle ${faq.is_active ? 'active' : ''}`}
                                        onClick={() => handleToggleActive(faq)}
                                        title={faq.is_active ? 'Deaktif Yap' : 'Aktif Yap'}
                                    >
                                        {faq.is_active ? '👁️' : '🚫'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-secondary"
                                        onClick={() => handleEdit(faq)}
                                    >
                                        ✏️ Düzenle
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(faq.id)}
                                    >
                                        🗑️ Sil
                                    </button>
                                </div>
                            </div>
                            <div className="faq-item-content">
                                <div className="faq-question">
                                    <strong>🇹🇷 TR:</strong> {faq.question_tr}
                                </div>
                                <div className="faq-question">
                                    <strong>🇬🇧 EN:</strong> {faq.question_en}
                                </div>
                                <div className="faq-question">
                                    <strong>🇩🇪 DE:</strong> {faq.question_de}
                                </div>
                                <div className="faq-answer">
                                    <small>{faq.answer_tr.substring(0, 150)}...</small>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingFaq ? '✏️ FAQ Düzenle' : '➕ Yeni FAQ Ekle'}</h2>
                            <button className="modal-close" onClick={resetForm}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="faq-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Kategori *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        required
                                    >
                                        {categories.filter(c => c.value !== 'all').map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Sıralama</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => handleInputChange('display_order', parseInt(e.target.value))}
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                        />
                                        {' '}Aktif
                                    </label>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>🇹🇷 Türkçe</h3>
                                <div className="form-group">
                                    <label>Soru *</label>
                                    <input
                                        type="text"
                                        value={formData.question_tr}
                                        onChange={(e) => handleInputChange('question_tr', e.target.value)}
                                        required
                                        placeholder="Örn: KolayDugun nedir?"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Cevap *</label>
                                    <textarea
                                        value={formData.answer_tr}
                                        onChange={(e) => handleInputChange('answer_tr', e.target.value)}
                                        required
                                        rows="4"
                                        placeholder="Detaylı cevap yazın..."
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>🇬🇧 English</h3>
                                <div className="form-group">
                                    <label>Question *</label>
                                    <input
                                        type="text"
                                        value={formData.question_en}
                                        onChange={(e) => handleInputChange('question_en', e.target.value)}
                                        required
                                        placeholder="e.g: What is KolayDugun?"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Answer *</label>
                                    <textarea
                                        value={formData.answer_en}
                                        onChange={(e) => handleInputChange('answer_en', e.target.value)}
                                        required
                                        rows="4"
                                        placeholder="Write detailed answer..."
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>🇩🇪 Deutsch</h3>
                                <div className="form-group">
                                    <label>Frage *</label>
                                    <input
                                        type="text"
                                        value={formData.question_de}
                                        onChange={(e) => handleInputChange('question_de', e.target.value)}
                                        required
                                        placeholder="z.B: Was ist KolayDugun?"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Antwort *</label>
                                    <textarea
                                        value={formData.answer_de}
                                        onChange={(e) => handleInputChange('answer_de', e.target.value)}
                                        required
                                        rows="4"
                                        placeholder="Detaillierte Antwort schreiben..."
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingFaq ? '💾 Güncelle' : '➕ Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFAQ;
