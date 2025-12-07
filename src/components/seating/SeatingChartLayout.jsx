import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SeatingChart.css';

const SeatingChartLayout = ({
    children,
    activeTab,
    onTabChange,
    totalGuests,
    assignedGuests,
    onAddTable,
    onAddGuest,
    onExportPdf,
    onEditDetails,
    hasData
}) => {
    const { t } = useTranslation();

    return (
        <div className="seating-chart-container">
            <header className="seating-header">
                <div>
                    <h1>{t('seating_chart.title')}</h1>
                    <p>{t('seating_chart.guest_status', { total: totalGuests, assigned: assignedGuests })}</p>
                </div>
                <div className="header-actions">
                    {hasData && (
                        <button className="btn btn-outline" onClick={onEditDetails} title="Düğün bilgilerini düzenle">
                            ⚙️ {t('common.edit')}
                        </button>
                    )}
                </div>
            </header>

            <div className="seating-toolbar">
                <div className="toolbar-left">
                    <button className="btn btn-primary" onClick={onAddTable}>
                        + {t('seating_chart.add_table')}
                    </button>
                    <button className="btn btn-secondary" onClick={onAddGuest}>
                        + {t('seating_chart.add_guest')}
                    </button>
                </div>
                <div className="toolbar-right">
                    <div className="tab-group">
                        <button
                            className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
                            onClick={() => onTabChange('tables')}
                        >
                            {t('seating_chart.tab_tables')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'guests' ? 'active' : ''}`}
                            onClick={() => onTabChange('guests')}
                        >
                            {t('seating_chart.tab_guests')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'schema' ? 'active' : ''}`}
                            onClick={() => onTabChange('schema')}
                        >
                            {t('seating_chart.tab_schema')}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'spreadsheet' ? 'active' : ''}`}
                            onClick={() => onTabChange('spreadsheet')}
                        >
                            {t('seating_chart.tab_spreadsheet')}
                        </button>
                    </div>
                    {hasData && (
                        <button className="btn btn-outline" onClick={onExportPdf}>
                            🖨️ Yazdır
                        </button>
                    )}
                </div>
            </div>

            <main className="seating-content">
                {children}
            </main>
        </div>
    );
};

export default SeatingChartLayout;
