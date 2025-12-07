import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './VendorCalendar.css';

const VendorCalendar = () => {
    const { t } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [blockedDates, setBlockedDates] = useState([
        '2024-06-15', '2024-06-22', '2024-07-06' // Demo data
    ]);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const toggleDate = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        if (blockedDates.includes(dateStr)) {
            setBlockedDates(blockedDates.filter(d => d !== dateStr));
        } else {
            setBlockedDates([...blockedDates, dateStr]);
        }
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        // Adjust for Monday start (Germany standard)
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isBlocked = blockedDates.includes(dateStr);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isBlocked ? 'blocked' : 'available'} ${isToday ? 'today' : ''}`}
                    onClick={() => toggleDate(day)}
                >
                    <span className="day-number">{day}</span>
                    {isBlocked && <span className="status-label">{t('calendar.booked') || 'Booked'}</span>}
                </div>
            );
        }

        return days;
    };

    const monthNames = [
        t('months.january') || 'January', t('months.february') || 'February', t('months.march') || 'March',
        t('months.april') || 'April', t('months.may') || 'May', t('months.june') || 'June',
        t('months.july') || 'July', t('months.august') || 'August', t('months.september') || 'September',
        t('months.october') || 'October', t('months.november') || 'November', t('months.december') || 'December'
    ];

    const weekDays = [
        t('weekdays.mon') || 'Mon', t('weekdays.tue') || 'Tue', t('weekdays.wed') || 'Wed',
        t('weekdays.thu') || 'Thu', t('weekdays.fri') || 'Fri', t('weekdays.sat') || 'Sat',
        t('weekdays.sun') || 'Sun'
    ];

    return (
        <div className="vendor-calendar-container">
            <div className="calendar-header">
                <h2>{t('dashboard.calendar') || 'Availability Calendar'}</h2>
                <div className="calendar-controls">
                    <button onClick={handlePrevMonth} className="btn-icon">&lt;</button>
                    <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <button onClick={handleNextMonth} className="btn-icon">&gt;</button>
                </div>
            </div>

            <div className="calendar-grid">
                <div className="weekdays-row">
                    {weekDays.map((day, index) => (
                        <div key={index} className="weekday">{day}</div>
                    ))}
                </div>
                <div className="days-grid">
                    {renderCalendar()}
                </div>
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <span className="dot available"></span>
                    <span>{t('calendar.available') || 'Available'}</span>
                </div>
                <div className="legend-item">
                    <span className="dot blocked"></span>
                    <span>{t('calendar.booked') || 'Booked / Unavailable'}</span>
                </div>
            </div>

            <p className="calendar-hint">
                {t('calendar.hint') || 'Click on a date to toggle availability.'}
            </p>
        </div>
    );
};

export default VendorCalendar;
