import React, { useState } from 'react';
import { usePlanning } from '../../context/PlanningContext';
import { useLanguage } from '../../context/LanguageContext';

const BudgetPlanner = ({ userId }) => {
    const { t } = useLanguage();
    const {
        budget,
        setBudget,
        budgetItems,
        addBudgetItem,
        updateBudgetItem,
        removeBudgetItem,
        loading
    } = usePlanning();

    const [newItem, setNewItem] = useState({ category: 'venue', item_name: '', estimated_cost: '', notes: '' });

    // Calculate summary from context data
    const totalEstimated = budgetItems.reduce((sum, item) => sum + (parseFloat(item.estimated) || 0), 0);
    const totalPaid = budgetItems.reduce((sum, item) => sum + (parseFloat(item.actual) || 0), 0);
    const remaining = (budget || 0) - totalPaid;

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.item_name || !newItem.estimated_cost) return;

        try {
            const finalNotes = newItem.item_name
                ? (newItem.notes ? `${newItem.item_name} - ${newItem.notes}` : newItem.item_name)
                : newItem.notes;

            await addBudgetItem({
                category: newItem.category,
                estimated: parseFloat(newItem.estimated_cost),
                actual: 0,
                notes: finalNotes
            });

            setNewItem({ category: 'venue', item_name: '', estimated_cost: '', notes: '' });
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    // Helper to handle legacy category names
    const getCategoryKey = (category) => {
        const mapping = {
            'Mekan': 'venue',
            'Düğün Mekânı': 'venue',
            'Yemek': 'food',
            'Yemek & İçecek': 'food',
            'Fotoğraf': 'photo',
            'Fotoğraf & Video': 'photo',
            'Gelinlik/Damatlık': 'dress',
            'Gelinlik & Damatlık': 'dress',
            'Müzik': 'music',
            'Müzik & DJ': 'music',
            'Çiçek Süsleme': 'flowers',
            'Davetiye': 'invite',
            'Düğün Pastası': 'cake',
            'Ulaşım': 'transport',
            'Balayı': 'honeymoon',
            'Diğer': 'other'
        };
        return mapping[category] || category;
    };

    if (loading) {
        return <div>{t('common.loading') || 'Yükleniyor...'}</div>;
    }

    return (
        <div className="budget-planner">
            <h2>💰 {t('budget.title') || 'Bütçe Planlayıcı'}</h2>

            <div className="budget-summary" style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', flexWrap: 'wrap' }}>
                <div className="summary-card" style={{ flex: '1 1 200px' }}>
                    <h4>{t('budget.summaryTotal') || 'Toplam Bütçe'}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1976d2' }}>€</span>
                        <input
                            type="number"
                            value={budget || ''}
                            onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#1976d2',
                                border: 'none',
                                background: 'transparent',
                                width: '100%',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
                <div className="summary-card" style={{ flex: '1 1 200px' }}>
                    <h4>{t('budget.summaryActual') || 'Harcanan'}</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>€{totalPaid.toFixed(2)}</p>
                </div>
                <div className="summary-card" style={{ flex: '1 1 200px' }}>
                    <h4>{t('budget.summaryRemaining') || 'Kalan'}</h4>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ed6c02' }}>€{remaining.toFixed(2)}</p>
                </div>
            </div>

            <form onSubmit={addItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <select
                    value={newItem.category}
                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    <option value="venue">{t('budget.categories.venue') || 'Mekan'}</option>
                    <option value="photo">{t('budget.categories.photo') || 'Fotoğraf'}</option>
                    <option value="music">{t('budget.categories.music') || 'Müzik'}</option>
                    <option value="dress">{t('budget.categories.dress') || 'Gelinlik/Damatlık'}</option>
                    <option value="other">{t('budget.categories.other') || 'Diğer'}</option>
                </select>
                <input
                    type="text"
                    placeholder={t('budget.categoryPlaceholder') || "Kalem adı (Örn: Düğün Salonu)"}
                    value={newItem.item_name}
                    onChange={e => setNewItem({ ...newItem, item_name: e.target.value })}
                    style={{ flex: 1, minWidth: '200px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                    type="text"
                    placeholder={t('budget.notesPlaceholder') || "Açıklama (Opsiyonel)"}
                    value={newItem.notes}
                    onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                    style={{ flex: 1, minWidth: '200px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                    type="number"
                    placeholder={t('budget.amountPlaceholder') || "Tahmini Tutar"}
                    value={newItem.estimated_cost}
                    onChange={e => setNewItem({ ...newItem, estimated_cost: e.target.value })}
                    style={{ width: '120px', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button type="submit" className="btn btn-primary">{t('budget.addBtn') || 'Ekle'}</button>
            </form>

            <div className="budget-list">
                <table className="table">
                    <thead>
                        <tr>
                            <th>{t('budget.tableCategory') || 'Kategori'}</th>
                            <th>{t('budget.tableNotes') || 'Kalem / Açıklama'}</th>
                            <th>{t('budget.tableEstimated') || 'Tahmini'}</th>
                            <th>{t('budget.tableActual') || 'Harcanan'}</th>
                            <th>{t('budget.tableStatus') || 'Durum'}</th>
                            <th>{t('budget.tableAction') || 'İşlem'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {budgetItems.map(item => {
                            const categoryKey = getCategoryKey(item.category);
                            const translatedCategory = t(`budget.categories.${categoryKey}`);
                            // If translation returns the key itself (and it's not a valid key), fallback to original category name
                            // But since we use getCategoryKey, it should be a valid key if it was in mapping
                            const displayCategory = translatedCategory === `budget.categories.${categoryKey}` ? item.category : translatedCategory;

                            return (
                                <tr key={item.id}>
                                    <td>{displayCategory}</td>
                                    <td>
                                        <input
                                            type="text"
                                            defaultValue={item.notes || ''}
                                            onBlur={(e) => updateBudgetItem(item.id, { notes: e.target.value })}
                                            placeholder="-"
                                            style={{ width: '100%', padding: '4px', border: '1px solid #eee', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td>€{item.estimated}</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={item.actual}
                                            onChange={(e) => updateBudgetItem(item.id, { actual: parseFloat(e.target.value) || 0 })}
                                            style={{ width: '80px', padding: '4px' }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={item.paid_amount >= item.actual && item.actual > 0}
                                            readOnly
                                            title={t('budget.paymentTooltip') || "Detaylı ödeme takibi için ana bütçe aracını kullanın"}
                                        />
                                    </td>
                                    <td>
                                        <button onClick={() => removeBudgetItem(item.id)} className="btn-sm btn-danger">{t('common.delete') || 'Sil'}</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BudgetPlanner;
