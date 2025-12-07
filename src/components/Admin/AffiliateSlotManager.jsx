import React, { useState } from 'react';

const AffiliateSlotManager = ({ slots, onUpdateSlot }) => {
    const [activeSlotId, setActiveSlotId] = useState(null);
    const [productInputs, setProductInputs] = useState({});

    const handleProductChange = (slotId, field, value) => {
        setProductInputs(prev => ({
            ...prev,
            [slotId]: {
                ...prev[slotId],
                [field]: value
            }
        }));
    };

    const handleSaveSlot = (slotId) => {
        const productData = productInputs[slotId];
        if (!productData || !productData.url || !productData.title) {
            alert('Lütfen ürün başlığı ve linkini girin.');
            return;
        }
        onUpdateSlot(slotId, productData);
        setActiveSlotId(null);
    };

    return (
        <div className="affiliate-slot-manager" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginTop: '20px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>💰 Affiliate Fırsatları ({slots.length})</h3>

            <div className="slots-grid" style={{ display: 'grid', gap: '15px' }}>
                {slots.map(slot => {
                    const isAssigned = slot.assignedProduct;
                    const isActive = activeSlotId === slot.id;

                    return (
                        <div key={slot.id} className="slot-card" style={{
                            background: '#fff',
                            padding: '15px',
                            borderRadius: '8px',
                            border: isAssigned ? '1px solid #22c55e' : '1px solid #cbd5e1',
                            borderLeft: isAssigned ? '4px solid #22c55e' : '4px solid #f59e0b'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                                <div>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        color: '#64748b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {slot.id}
                                    </span>
                                    <h4 style={{ margin: '5px 0', fontSize: '1rem' }}>
                                        {isAssigned ? '✅ Ürün Eklendi' : `Öneri: ${slot.suggested_product_type}`}
                                    </h4>
                                </div>
                                {!isActive && !isAssigned && (
                                    <button
                                        className="btn-sm btn-primary"
                                        onClick={() => setActiveSlotId(slot.id)}
                                    >
                                        Ürün Ekle
                                    </button>
                                )}
                                {isAssigned && (
                                    <button
                                        className="btn-sm btn-secondary"
                                        onClick={() => setActiveSlotId(slot.id)}
                                    >
                                        Düzenle
                                    </button>
                                )}
                            </div>

                            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '10px', fontStyle: 'italic' }}>
                                "...{slot.context_summary}..."
                            </p>

                            {isActive && (
                                <div className="slot-editor" style={{ marginTop: '15px', padding: '15px', background: '#f1f5f9', borderRadius: '8px' }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>Amazon Araması (Kopyala)</label>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <input
                                                type="text"
                                                readOnly
                                                value={slot.search_keywords.de[0]}
                                                className="form-control"
                                                style={{ background: '#e2e8f0' }}
                                            />
                                            <a
                                                href={`https://www.amazon.de/s?k=${encodeURIComponent(slot.search_keywords.de[0])}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary"
                                                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                            >
                                                🔍 Ara
                                            </a>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Ürün Başlığı</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Örn: 10m LED Işık Zinciri"
                                            value={productInputs[slot.id]?.title || slot.assignedProduct?.title || ''}
                                            onChange={e => handleProductChange(slot.id, 'title', e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Ürün Linki (Affiliate URL)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="https://amzn.to/..."
                                            value={productInputs[slot.id]?.url || slot.assignedProduct?.url || ''}
                                            onChange={e => handleProductChange(slot.id, 'url', e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleSaveSlot(slot.id)}
                                            style={{ flex: 1 }}
                                        >
                                            Kaydet
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setActiveSlotId(null)}
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AffiliateSlotManager;
