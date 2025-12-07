import React, { useState } from 'react';
import { usePlanning } from '../../context/PlanningContext';
import { useLanguage } from '../../context/LanguageContext';

const Checklist = ({ userId }) => {
    const { t } = useLanguage();
    const { tasks, addTask, updateTask, removeTask, loading } = usePlanning();
    const [newItem, setNewItem] = useState('');

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        await addTask({
            title: newItem,
            category: 'General',
            completed: false
        });
        setNewItem('');
    };

    const toggleItem = (id, is_completed) => {
        updateTask(id, { is_completed });
    };

    if (loading) return <div>{t('common.loading') || 'Yükleniyor...'}</div>;

    // Filter tasks to show only incomplete ones or recent ones? 
    // For dashboard, maybe show all or just top 5?
    // Let's show all for now, sorted by completion (incomplete first)
    const sortedTasks = [...tasks].sort((a, b) => (a.is_completed === b.is_completed ? 0 : a.is_completed ? 1 : -1));

    return (
        <div className="checklist-container">
            <h2>✅ {t('checklist.title') || 'Yapılacaklar Listesi'}</h2>

            <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={t('checklist.placeholder') || "Yeni görev ekle..."}
                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <button type="submit" className="btn btn-primary">{t('common.add') || 'Ekle'}</button>
            </form>

            <div className="checklist-items" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                {sortedTasks.length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center' }}>{t('checklist.empty') || 'Henüz görev eklenmedi.'}</p>
                ) : (
                    sortedTasks.map(item => (
                        <div key={item.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px',
                            background: '#fff',
                            border: '1px solid #eee',
                            borderRadius: '6px',
                            textDecoration: item.is_completed ? 'line-through' : 'none',
                            opacity: item.is_completed ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}>
                            <input
                                type="checkbox"
                                checked={item.is_completed}
                                onChange={(e) => toggleItem(item.id, e.target.checked)}
                                style={{ marginRight: '15px', width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <span style={{ flex: 1 }}>{item.title}</span>
                            <button
                                onClick={() => removeTask(item.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '5px' }}
                                title={t('common.delete') || 'Sil'}
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Checklist;
