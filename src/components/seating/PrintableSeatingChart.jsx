import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PrintableSeatingChart.css';
import { useTranslation } from 'react-i18next';

const PrintableSeatingChart = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { weddingDetails, tables, guests } = location.state || {};

    if (!weddingDetails || !tables || !guests) {
        return (
            <div className="no-data-container">
                <p>{t('seating_chart.no_data')}</p>
                <button onClick={() => navigate('/tools/seating')} className="btn btn-primary">
                    {t('common.back')}
                </button>
            </div>
        );
    }

    const assignedGuestsCount = guests.filter(g => g.table_id).length;
    const unassignedGuests = guests.filter(g => !g.table_id);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="printable-seating-chart">
            {/* Action Buttons */}
            <div className="print-actions">
                <button onClick={() => navigate('/tools/seating')} className="btn btn-secondary">
                    ← {t('common.back')}
                </button>
                <button onClick={handlePrint} className="btn btn-primary">
                    {t('seating_chart.print_save_pdf')}
                </button>
            </div>

            {/* Header */}
            <div className="print-header">
                <h1>{t('seating_chart.title')}</h1>
                <div className="venue-name">{weddingDetails.venue_name}</div>
            </div>

            {/* Summary Cards */}
            <div className="print-summary">
                <div className="summary-item">
                    <strong>{t('seating_chart.total_guests')}</strong>
                    <span>{weddingDetails.total_guests}</span>
                </div>
                <div className="summary-item">
                    <strong>{t('seating_chart.assigned_guests')}</strong>
                    <span>{assignedGuestsCount}</span>
                </div>
                <div className="summary-item">
                    <strong>{t('seating_chart.unassigned_guests')}</strong>
                    <span>{guests.length - assignedGuestsCount}</span>
                </div>
                <div className="summary-item">
                    <strong>{t('seating_chart.total_tables')}</strong>
                    <span>{tables.length}</span>
                </div>
            </div>

            {/* Tables Section */}
            <div className="print-section">
                <h2>{t('seating_chart.tables_and_guests')}</h2>
                {tables.map(table => {
                    const tableGuests = guests.filter(g => g.table_id === table.id);
                    return (
                        <div key={table.id} className="table-item">
                            <div className="table-header">
                                <div className="table-name">{table.name}</div>
                                <div className="table-info">
                                    {t(`seating_chart.${table.type}`)} • {tableGuests.length}/{table.capacity} {t('seating_chart.seats')}
                                </div>
                            </div>
                            <ul className="guest-list">
                                {tableGuests.length > 0 ? (
                                    tableGuests.map((guest, index) => (
                                        <li key={guest.id}>
                                            {guest.name}
                                            {guest.plus_ones > 0 && ` (+${guest.plus_ones})`}
                                        </li>
                                    ))
                                ) : (
                                    <li className="no-guests">{t('seating_chart.no_guests_assigned')}</li>
                                )}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Unassigned Guests */}
            {unassignedGuests.length > 0 && (
                <div className="unassigned-section">
                    <div className="print-section">
                        <h2>{t('seating_chart.unassigned_guests_title')}</h2>
                        <ul className="unassigned-list">
                            {unassignedGuests.map(guest => (
                                <li key={guest.id}>
                                    {guest.name}
                                    {guest.plus_ones > 0 && ` (+${guest.plus_ones})`}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrintableSeatingChart;
