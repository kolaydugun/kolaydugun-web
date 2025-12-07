import React, { useState, useEffect } from 'react';
import { usePlanning } from '../context/PlanningContext';
import { useLanguage } from '../context/LanguageContext';
import usePageTitle from '../hooks/usePageTitle';
import './Timeline.css';

const Timeline = () => {
    usePageTitle('Timeline');
    const { t } = useLanguage();
    const { weddingDate, setWeddingDate, tasks, addTask, updateTask, removeTask, loading } = usePlanning();
    const [newTaskText, setNewTaskText] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [error, setError] = useState('');

    if (loading) {
        return (
            <div className="section container" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Varsayılan görevler (düğün tarihine göre otomatik oluşturulur)
    // Varsayılan görevler (düğün tarihine göre otomatik oluşturulur)
    const defaultTasks = [
        { month: 12, title: t('timeline.defaultTasks.setDate'), category: t('categories.General') || 'Genel' },
        { month: 12, title: t('timeline.defaultTasks.budget'), category: t('categories.Budget') || 'Bütçe' },
        { month: 11, title: t('timeline.defaultTasks.venue'), category: t('categories.Venue') || 'Mekân' },
        { month: 11, title: t('timeline.defaultTasks.photo'), category: t('categories.Photo') || 'Fotoğraf' },
        { month: 10, title: t('timeline.defaultTasks.dress'), category: t('categories.Attire') || 'Kıyafet' },
        { month: 10, title: t('timeline.defaultTasks.inviteDesign'), category: t('categories.Invitations') || 'Davetiye' },
        { month: 9, title: t('timeline.defaultTasks.music'), category: t('categories.Entertainment') || 'Eğlence' },
        { month: 9, title: t('timeline.defaultTasks.florist'), category: t('categories.Decoration') || 'Dekorasyon' },
        { month: 8, title: t('timeline.defaultTasks.cake'), category: t('categories.Food') || 'Yemek' },
        { month: 8, title: t('timeline.defaultTasks.guestList'), category: t('categories.Guests') || 'Misafirler' },
        { month: 7, title: t('timeline.defaultTasks.sendInvites'), category: t('categories.Invitations') || 'Davetiye' },
        { month: 6, title: t('timeline.defaultTasks.honeymoon'), category: t('categories.Honeymoon') || 'Balayı' },
        { month: 5, title: t('timeline.defaultTasks.fittings'), category: t('categories.Attire') || 'Kıyafet' },
        { month: 4, title: t('timeline.defaultTasks.seating'), category: t('categories.Organization') || 'Organizasyon' },
        { month: 3, title: t('timeline.defaultTasks.rsvp'), category: t('categories.Guests') || 'Misafirler' },
        { month: 2, title: t('timeline.defaultTasks.schedule'), category: t('categories.Organization') || 'Organizasyon' },
        { month: 1, title: t('timeline.defaultTasks.vendors'), category: t('categories.General') || 'Genel' },
        { month: 1, title: t('timeline.defaultTasks.emergency'), category: t('categories.General') || 'Genel' },
        { month: 0, title: t('timeline.defaultTasks.final'), category: t('categories.General') || 'Genel' },
    ];

    const getMonthsUntilWedding = () => {
        if (!weddingDate) return 12;
        const today = new Date();
        const wedding = new Date(weddingDate);
        const months = Math.max(0, Math.ceil((wedding - today) / (1000 * 60 * 60 * 24 * 30)));
        return months;
    };

    const monthsRemaining = getMonthsUntilWedding();

    const handleAddTask = (e) => {
        e.preventDefault();
        setError('');
        if (!newTaskText.trim()) {
            setError('Lütfen bir görev adı girin.');
            return;
        }
        addTask({
            title: newTaskText,
            category: 'Özel',
            month: parseInt(selectedMonth) || 0,
            completed: false,
            notes: ''
        });
        setNewTaskText('');
    };

    const filteredTasks = tasks.filter(task =>
        selectedMonth === 'all' || task.month === parseInt(selectedMonth)
    );

    const groupedTasks = filteredTasks.reduce((acc, task) => {
        const key = task.month;
        if (!acc[key]) acc[key] = [];
        acc[key].push(task);
        return acc;
    }, {});

    return (
        <div className="section container timeline-container">
            <h2 className="timeline-header">📅 {t('timeline.title') || 'Ajandam'}</h2>
            <p className="timeline-desc">
                {t('timeline.desc') || 'Düğün tarihinize göre aylık yapılacaklar listesi. Görevleri kişiselleştirin ve ilerlemenizi takip edin.'}
            </p>

            {/* Düğün Tarihi Seçimi */}
            <div className="date-selection-card">
                <label htmlFor="wedding-date" className="date-label">
                    {t('vendorDetail.date') || 'Düğün Tarihiniz:'}
                </label>
                <input
                    id="wedding-date"
                    type="date"
                    value={weddingDate || ''}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="date-input"
                    aria-label={t('vendorDetail.date')}
                />
                {weddingDate && (
                    <p className="countdown-text">
                        {monthsRemaining} {t('timeline.monthsRemaining') || 'ay kaldı!'} 🎉
                    </p>
                )}
            </div>

            {/* Filtre ve Yeni Görev Ekleme */}
            <div className="task-controls-card">
                <div className="filter-container">
                    <label htmlFor="month-filter" className="sr-only">{t('filters.all')}</label>
                    <select
                        id="month-filter"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="month-select"
                        aria-label={t('filters.all')}
                    >
                        <option value="all">{t('filters.all') || 'Tüm Aylar'}</option>
                        {[...Array(13)].map((_, i) => (
                            <option key={i} value={12 - i}>
                                {12 - i} {t('timeline.monthsAgo') || 'ay önce'}
                            </option>
                        ))}
                    </select>
                </div>

                <form onSubmit={handleAddTask} className="add-task-form">
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <input
                            type="text"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder={t('timeline.placeholderActivity') || 'Yeni görev ekle...'}
                            className="task-input"
                            aria-label={t('timeline.activity')}
                            aria-invalid={!!error}
                        />
                        {error && <span className="error-message" role="alert">{error}</span>}
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary add-task-btn"
                        aria-label={t('timeline.addEvent')}
                    >
                        + {t('budget.addBtn') || 'Ekle'}
                    </button>
                </form>
            </div>

            {/* Görev Listesi */}
            <div className="task-list" aria-label={t('timeline.title')}>
                {Object.keys(groupedTasks).sort((a, b) => b - a).map(month => (
                    <div key={month} className="month-group-card">
                        <h3 className="month-title">
                            {month === '0' ? (t('timeline.weddingMonth') || 'Düğün Ayı') : `${month} ${t('timeline.monthsAgo') || 'Ay Önce'}`}
                        </h3>
                        <div className="tasks-container">
                            {groupedTasks[month].map(task => (
                                <div
                                    key={task.id}
                                    className={`task-item ${task.completed ? 'completed' : ''}`}
                                >
                                    <div className="task-content-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={() => updateTask(task.id, { completed: !task.completed })}
                                            className="task-checkbox"
                                            aria-label={`${task.title}`}
                                        />
                                        <div className="task-details">
                                            <p className={`task-title ${task.completed ? 'completed' : ''}`}>
                                                {task.title}
                                            </p>
                                            <span className="task-category">
                                                {task.category}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeTask(task.id)}
                                            className="delete-task-btn"
                                            aria-label={`${t('timeline.delete')} ${task.title}`}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    {task.notes && (
                                        <p className="task-notes">
                                            📝 {task.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {tasks.length === 0 && (
                <div className="empty-state">
                    <p className="empty-icon">📋</p>
                    <p>{t('timeline.emptyState') || 'Henüz görev eklenmedi.'}</p>
                </div>
            )}
        </div>
    );
};

export default Timeline;
