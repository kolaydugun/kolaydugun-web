import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SimpleEditor from '../components/SimpleEditor'; // Reusing for description if needed, or just text area
import './AdminConfig.css'; // Reuse admin styles

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCategory, setEditingCategory] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory({ ...category });
    };

    const handleCancel = () => {
        setEditingCategory(null);
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('categories')
                .update({
                    name: editingCategory.name,
                    description: editingCategory.description,
                    image_url: editingCategory.image_url,
                    icon: editingCategory.icon,
                    is_featured: editingCategory.is_featured,
                    sort_order: editingCategory.sort_order,
                    slug: editingCategory.slug
                })
                .eq('id', editingCategory.id);

            if (error) throw error;

            await fetchCategories();
            setEditingCategory(null);
            alert('Kategori başarıyla güncellendi!');
        } catch (error) {
            console.error('Error updating category:', error);
            alert('Güncelleme sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'category-images' bucket
            // Ensure this bucket exists in Supabase Storage and is set to Public
            const { data, error: uploadError } = await supabase.storage
                .from('category-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload error details:', uploadError);
                throw uploadError;
            }

            const { data: urlData } = supabase.storage
                .from('category-images')
                .getPublicUrl(filePath);

            setEditingCategory(prev => ({ ...prev, image_url: urlData.publicUrl }));
        } catch (error) {
            console.error('Error uploading image:', error);
            let msg = 'Resim yüklenirken bir hata oluştu.';
            if (error.message && error.message.includes('Bucket not found')) {
                msg = "Hata: 'category-images' isimli Storage Bucket bulunamadı. Lütfen Supabase panelinden bu bucket'ı oluşturun ve Public yapın.";
            } else if (error.statusCode === '403' || error.error === 'Unauthorized') {
                msg = "Yetki hatası: Lütfen Storage Bucket politikalarını (Policies) kontrol edin.";
            } else {
                msg += ` (${error.message})`;
            }
            alert(msg);
        } finally {
            setUploading(false);
        }
    };

    if (loading && !categories.length) return <div className="p-4">Yükleniyor...</div>;

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <h1>Kategori Yönetimi</h1>
                <p>Sitedeki kategorileri ve resimlerini buradan yönetebilirsiniz.</p>
            </div>

            {editingCategory ? (
                <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h3>Kategori Düzenle: {editingCategory.name}</h3>

                    <div className="form-group">
                        <label>Kategori Adı (İngilizce - DB Key)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingCategory.name}
                            onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            disabled
                        />
                        <small className="text-muted">Sistem bütünlüğü için isim değiştirilemez.</small>
                    </div>

                    <div className="form-group">
                        <label>URL Slug</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingCategory.slug || ''}
                            onChange={e => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                        />
                        <small className="text-muted">URL'de görünecek isim (örn: dugun-mekanlari)</small>
                    </div>

                    <div className="form-group">
                        <label>Açıklama</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={editingCategory.description || ''}
                            onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>İkon (Emoji)</label>
                        <input
                            type="text"
                            className="form-control"
                            value={editingCategory.icon || ''}
                            onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <label>Sıralama (Sort Order)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editingCategory.sort_order || 0}
                                onChange={e => setEditingCategory({ ...editingCategory, sort_order: parseInt(e.target.value) })}
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: '25px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={editingCategory.is_featured !== false} // Default true
                                    onChange={e => setEditingCategory({ ...editingCategory, is_featured: e.target.checked })}
                                    style={{ width: '20px', height: '20px', marginRight: '10px' }}
                                />
                                Anasayfada Göster (Featured)
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Kategori Resmi</label>
                        <div className="image-preview-container" style={{ marginBottom: '15px' }}>
                            {editingCategory.image_url ? (
                                <img
                                    src={editingCategory.image_url}
                                    alt="Preview"
                                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                            ) : (
                                <div className="no-image-placeholder">Resim Yok</div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                        />
                        {uploading && <span>Yükleniyor...</span>}
                    </div>

                    <div className="button-group" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                            {loading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                        <button className="btn btn-secondary" onClick={handleCancel}>İptal</button>
                    </div>
                </div>
            ) : (
                <div className="admin-grid">
                    {categories.map(cat => (
                        <div key={cat.id} className="admin-card category-card-item" style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: cat.is_featured === false ? 0.6 : 1 }}>
                            <div style={{ height: '150px', overflow: 'hidden', borderRadius: '4px', background: '#f0f0f0', position: 'relative' }}>
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>Resim Yok</div>
                                )}
                                {cat.is_featured !== false && (
                                    <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'gold', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Featured</div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{cat.icon} {cat.name}</h4>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(cat)}>Düzenle</button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                                <span>Sıra: {cat.sort_order || 0}</span>
                                <span>Slug: {cat.slug}</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{cat.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
