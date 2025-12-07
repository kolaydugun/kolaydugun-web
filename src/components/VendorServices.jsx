import React, { useState } from 'react';
import { useVendors } from '../context/VendorContext';
import { useLanguage } from '../context/LanguageContext';
import './VendorServices.css';

const VendorServices = () => {
    const { t } = useLanguage();
    // Hardcoded vendor ID for demo purposes, similar to Profile
    const vendorId = 1;
    const { getVendor, updateVendor } = useVendors();
    const vendor = getVendor(vendorId);

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: ''
    });

    if (!vendor) return <div>{t('vendors.notFound') || 'Vendor not found'}</div>;

    const services = vendor.services || [];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingId) {
            // Update existing
            const updatedServices = services.map(s =>
                s.id === editingId ? { ...s, ...formData } : s
            );
            updateVendor(vendorId, { services: updatedServices });
            setEditingId(null);
        } else {
            // Add new
            const newService = {
                id: Date.now(),
                ...formData
            };
            updateVendor(vendorId, { services: [...services, newService] });
        }

        setFormData({ name: '', description: '', price: '', duration: '' });
        setIsAdding(false);
    };

    const handleEdit = (service) => {
        setFormData({
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration
        });
        setEditingId(service.id);
        setIsAdding(true);
    };

    const handleDelete = (id) => {
        if (window.confirm(t('common.confirmDelete') || 'Are you sure?')) {
            const updatedServices = services.filter(s => s.id !== id);
            updateVendor(vendorId, { services: updatedServices });
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', description: '', price: '', duration: '' });
    };

    return (
        <div className="vendor-services-container">
            <div className="services-header">
                <h2>{t('dashboard.services') || 'My Services'}</h2>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        + {t('services.add') || 'Add Service'}
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="service-form-card">
                    <h3>{editingId ? (t('services.edit') || 'Edit Service') : (t('services.addNew') || 'Add New Service')}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>{t('services.name') || 'Service Name'}</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="e.g. Full Wedding Photography"
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('services.description') || 'Description'}</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                placeholder="Describe what's included..."
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>{t('services.price') || 'Starting Price'}</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="e.g. €1500"
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('services.duration') || 'Duration'}</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    placeholder="e.g. 8 hours"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                {t('common.cancel') || 'Cancel'}
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {t('common.save') || 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="services-list">
                {services.length === 0 && !isAdding ? (
                    <div className="empty-state">
                        <p>{t('services.empty') || 'No services listed yet. Add your first service!'}</p>
                    </div>
                ) : (
                    services.map(service => (
                        <div key={service.id} className="service-card">
                            <div className="service-info">
                                <h4>{service.name}</h4>
                                <p className="service-desc">{service.description}</p>
                                <div className="service-meta">
                                    {service.price && <span className="service-price">💰 {service.price}</span>}
                                    {service.duration && <span className="service-duration">⏱️ {service.duration}</span>}
                                </div>
                            </div>
                            <div className="service-actions">
                                <button className="btn-icon" onClick={() => handleEdit(service)} aria-label="Edit">
                                    ✏️
                                </button>
                                <button className="btn-icon delete" onClick={() => handleDelete(service.id)} aria-label="Delete">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VendorServices;
