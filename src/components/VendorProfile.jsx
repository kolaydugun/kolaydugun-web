import React, { useState, useEffect } from 'react';
import { useVendors } from '../context/VendorContext';
import { useLanguage } from '../context/LanguageContext';

const VendorProfile = ({ vendor, user }) => {
    const { t } = useLanguage();
    const { updateVendor } = useVendors();
    const [editMode, setEditMode] = useState(false);
    const [newImage, setNewImage] = useState('');
    const [form, setForm] = useState({
        capacity: 0,
        priceRange: '',
        tags: '',
        plan: 'Free',
        isFeatured: false,
        gallery: [],
        membershipActive: false,
        subscriptionStart: '',
        subscriptionEnd: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (vendor) {
            setForm({
                capacity: vendor.capacity || 0,
                priceRange: vendor.priceRange || '',
                tags: vendor.tags?.join(', ') || '',
                plan: vendor.plan || 'Free',
                isFeatured: vendor.isFeatured || false,
                gallery: vendor.gallery || [],
                membershipActive: vendor.membershipActive || false,
                subscriptionStart: vendor.subscriptionStart || '',
                subscriptionEnd: vendor.subscriptionEnd || ''
            });
        }
    }, [vendor]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleAddImage = () => {
        if (newImage.trim()) {
            // Check limits based on plan
            const isPremium = form.plan?.toLowerCase() === 'premium';
            const limit = isPremium ? 50 : 3;

            if (form.gallery.length >= limit) {
                alert(t('dashboard.photoLimitReached') || `Photo limit reached (${limit} photos max for ${form.plan} plan)`);
                return;
            }

            setForm(prev => ({
                ...prev,
                gallery: [...prev.gallery, newImage.trim()]
            }));
            setNewImage('');
        }
    };

    const handleRemoveImage = (index) => {
        setForm(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (form.capacity < 0) newErrors.capacity = 'Capacity cannot be negative';
        if (!form.priceRange) newErrors.priceRange = 'Price range is required';

        if (form.membershipActive) {
            if (!form.subscriptionStart) newErrors.subscriptionStart = 'Start date required for active membership';
            if (!form.subscriptionEnd) newErrors.subscriptionEnd = 'End date required for active membership';
            if (form.subscriptionStart && form.subscriptionEnd && new Date(form.subscriptionStart) > new Date(form.subscriptionEnd)) {
                newErrors.subscriptionEnd = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const updates = {
            capacity: Number(form.capacity),
            priceRange: form.priceRange,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            plan: form.plan,
            isFeatured: form.isFeatured,
            gallery: form.gallery,
            membershipActive: form.membershipActive,
            subscriptionStart: form.subscriptionStart,
            subscriptionEnd: form.subscriptionEnd
        };
        const numericId = parseInt(user.id.replace('vendor_', ''), 10);
        updateVendor(numericId, updates);
        setEditMode(false);
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>{t('dashboard.profile') || 'Profil'}</h3>
                {!editMode && (
                    <button type="button" className="btn btn-primary" onClick={() => setEditMode(true)} aria-label="Edit profile">
                        {t('edit') || 'Bearbeiten'}
                    </button>
                )}
            </div>

            {editMode ? (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {/* Form fields similar to original VendorDashboard */}
                    <label>
                        {t('filters.capacity') || 'Kapazität'}
                        <input
                            type="number"
                            name="capacity"
                            value={form.capacity}
                            onChange={handleChange}
                            style={{ borderColor: errors.capacity ? 'var(--color-accent)' : '' }}
                        />
                        {errors.capacity && <span style={{ color: 'var(--color-accent)', fontSize: '0.85rem' }}>{errors.capacity}</span>}
                    </label>
                    <label>
                        {t('filters.price') || 'Preisklasse'}
                        <select
                            name="priceRange"
                            value={form.priceRange}
                            onChange={handleChange}
                            style={{ borderColor: errors.priceRange ? 'var(--color-accent)' : '' }}
                        >
                            <option value="">Select range</option>
                            <option>€</option>
                            <option>€€</option>
                            <option>€€€</option>
                            <option>€€€€</option>
                        </select>
                        {errors.priceRange && <span style={{ color: 'var(--color-accent)', fontSize: '0.85rem' }}>{errors.priceRange}</span>}
                    </label>
                    <label>
                        {t('filters.tags') || 'Stichworte'} (comma separated)
                        <input type="text" name="tags" value={form.tags} onChange={handleChange} />
                    </label>

                    {/* Gallery Management */}
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                        <h4>Gallery Management</h4>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Enter image URL"
                                aria-label="New image URL"
                                value={newImage}
                                onChange={(e) => setNewImage(e.target.value)}
                                style={{ flex: 1, marginBottom: 0 }}
                            />
                            <button type="button" className="btn btn-secondary" onClick={handleAddImage} aria-label="Add image to gallery">Add Image</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                            {form.gallery && form.gallery.map((img, index) => (
                                <div key={index} style={{ position: 'relative', aspectRatio: '1' }}>
                                    <img src={img} alt={`Gallery ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--border-radius-sm)' }} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        aria-label={`Remove image ${index + 1}`}
                                        style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            background: 'var(--color-accent)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px'
                                        }}
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <button type="button" className="btn btn-primary" onClick={handleSave} aria-label="Save profile changes">Save Changes</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)} style={{ marginLeft: '0.5rem' }} aria-label="Cancel editing">Cancel</button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <p><strong>{t('filters.category')}:</strong> {vendor.category}</p>
                        <p><strong>{t('filters.city')}:</strong> {vendor.location}</p>
                        <p><strong>{t('filters.capacity')}:</strong> {vendor.capacity}</p>
                        <p><strong>{t('filters.price')}:</strong> {vendor.priceRange}</p>
                        <p><strong>{t('filters.tags')}:</strong> {vendor.tags?.join(', ')}</p>
                    </div>

                    <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
                        <strong>Gallery ({vendor.gallery?.length || 0} items)</strong>
                        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
                            {vendor.gallery && vendor.gallery.map((img, index) => (
                                <img key={index} src={img} alt={`Gallery ${index}`} style={{ height: '80px', borderRadius: 'var(--border-radius-sm)' }} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProfile;
