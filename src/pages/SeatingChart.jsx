import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import SeatingChartLayout from '../components/seating/SeatingChartLayout';
import InitialSetupModal from '../components/seating/InitialSetupModal';
import SchemaView from '../components/seating/SchemaView';
import TableList from '../components/seating/TableList';
import GuestList from '../components/seating/GuestList';
import SpreadsheetView from '../components/seating/SpreadsheetView';
import AddTableModal from '../components/seating/AddTableModal';
import AddGuestModal from '../components/seating/AddGuestModal';
import '../components/seating/SeatingChart.css';

const SeatingChart = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('schema'); // schema, tables, guests, spreadsheet
    const [showInitialModal, setShowInitialModal] = useState(false);
    const [showAddTableModal, setShowAddTableModal] = useState(false);
    const [showAddGuestModal, setShowAddGuestModal] = useState(false);

    // Data State
    const [weddingDetails, setWeddingDetails] = useState(null);
    const [tables, setTables] = useState([]);
    const [guests, setGuests] = useState([]);

    // Drag State
    const [activeDragId, setActiveDragId] = useState(null);
    const [activeDragType, setActiveDragType] = useState(null); // 'guest' or 'table'

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Wedding Details
            const { data: details, error: detailsError } = await supabase
                .from('wedding_details')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (detailsError && detailsError.code !== 'PGRST116') throw detailsError;

            // If no details or missing critical info, show initial modal
            if (!details || !details.total_guests || !details.venue_name) {
                setShowInitialModal(true);
            }
            setWeddingDetails(details || {});

            // Fetch Tables
            const { data: tablesData, error: tablesError } = await supabase
                .from('seating_tables')
                .select('*')
                .order('created_at');
            if (tablesError) throw tablesError;
            setTables(tablesData || []);

            // Fetch Guests
            const { data: guestsData, error: guestsError } = await supabase
                .from('guests')
                .select('*')
                .order('name');
            if (guestsError) throw guestsError;
            setGuests(guestsData || []);

        } catch (error) {
            console.error('Error fetching seating data:', error);
            alert('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialSave = async (data) => {
        console.log('handleInitialSave called with:', data);
        try {
            const payload = {
                user_id: user.id,
                total_guests: parseInt(data.totalGuests),
                venue_name: data.venueName,
                updated_at: new Date()
            };
            console.log('Sending payload to Supabase:', payload);

            const { data: result, error } = await supabase
                .from('wedding_details')
                .upsert(payload)
                .select();

            console.log('Supabase response:', { result, error });

            if (error) throw error;

            console.log('Save successful, closing modal...');
            setShowInitialModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving initial details:', error);
            if (error.code === 'PGRST204') {
                alert('Hata: Veritabanı güncel değil (Eksik sütun: ' + error.message + '). Lütfen \"20240101_seating_chart_final.sql\" dosyasını TEKRAR çalıştırın.');
            } else {
                alert('Kaydedilirken hata oluştu: ' + error.message);
            }
        }
    };

    const handleEditDetails = () => {
        setShowInitialModal(true);
    };

    const handleAddTable = async (tableData) => {
        try {
            const { error } = await supabase
                .from('seating_tables')
                .insert([{
                    user_id: user.id,
                    ...tableData
                }]);

            if (error) throw error;
            setShowAddTableModal(false);
            fetchData(); // Refresh to get new table
        } catch (error) {
            console.error('Error adding table:', error);
            alert('Masa eklenirken hata oluştu.');
        }
    };

    const handleAddGuest = async (guestData) => {
        console.log('handleAddGuest called with:', guestData);
        try {
            const payload = {
                user_id: user.id,
                ...guestData
            };
            console.log('Sending guest payload:', payload);

            const { data, error } = await supabase
                .from('guests')
                .insert([payload])
                .select();

            console.log('Guest save response:', { data, error });

            if (error) throw error;
            setShowAddGuestModal(false);
            fetchData();
        } catch (error) {
            console.error('Error adding guest:', error);
            console.error('Error details:', error.details);
            console.error('Error message:', error.message);
            alert(t('seating_chart.add_guest_error') + ': ' + error.message);
        }
    };

    const handleDeleteTable = async (tableId) => {
        console.log('Deleting table:', tableId);

        try {
            console.log('Sending delete request for table:', tableId);
            const { error } = await supabase
                .from('seating_tables')
                .delete()
                .eq('id', tableId);

            if (error) {
                console.error('Supabase error deleting table:', error);
                throw error;
            }

            console.log('Table deleted successfully, clearing guest assignments...');
            // Also clear assignments for guests at this table
            const { error: guestError } = await supabase
                .from('guests')
                .update({ table_id: null, seat_index: null })
                .eq('table_id', tableId);

            if (guestError) {
                console.error('Supabase error clearing guest assignments:', guestError);
                throw guestError;
            }

            console.log('Guest assignments cleared. Fetching fresh data...');
            fetchData();
        } catch (error) {
            console.error('Error deleting table:', error);
            alert(t('seating_chart.delete_table_error'));
        }
    };

    const handleDeleteGuest = async (guestId) => {
        console.log('Deleting guest:', guestId);

        try {
            console.log('Sending delete request for guest:', guestId);
            const { error } = await supabase
                .from('guests')
                .delete()
                .eq('id', guestId);

            if (error) {
                console.error('Supabase error deleting guest:', error);
                throw error;
            }

            console.log('Guest deleted successfully. Fetching fresh data...');
            fetchData();
        } catch (error) {
            console.error('Error deleting guest:', error);
            alert(t('common.error'));
        }
    };

    // Drag & Drop Handlers
    const handleDragStart = (event) => {
        setActiveDragId(event.active.id);
        setActiveDragType(event.active.data.current?.type);
    };

    const handleDragEnd = async (event) => {
        const { active, over, delta } = event;
        setActiveDragId(null);
        setActiveDragType(null);

        // Table Dragging
        if (active.data.current?.type === 'table') {
            const tableId = active.id;
            const table = tables.find(t => t.id === tableId);

            if (table) {
                const newX = (table.x || 0) + delta.x;
                const newY = (table.y || 0) + delta.y;

                // Optimistic Update
                setTables(prev => prev.map(t =>
                    t.id === tableId ? { ...t, x: newX, y: newY } : t
                ));

                try {
                    const { error } = await supabase
                        .from('seating_tables')
                        .update({ x: newX, y: newY })
                        .eq('id', tableId);

                    if (error) throw error;
                } catch (error) {
                    console.error('Error moving table:', error);
                    // Revert on error
                    fetchData();
                }
            }
            return;
        }

        if (!over) return;

        // Guest dropped on a Seat
        if (active.data.current?.type === 'guest' && over.data.current?.type === 'seat') {
            const guestId = active.id;
            const { tableId, seatIndex } = over.data.current;

            try {
                const { error } = await supabase
                    .from('guests')
                    .update({
                        table_id: tableId,
                        seat_index: seatIndex
                    })
                    .eq('id', guestId);

                if (error) throw error;
                fetchData();
            } catch (error) {
                console.error('Error assigning guest:', error);
                alert('Misafir yerleştirilirken hata oluştu.');
            }
        }
    };

    const handlePdfExport = () => {
        // Navigate to print view with data in state
        navigate('/tools/seating/print', {
            state: { weddingDetails, tables, guests }
        });
    };

    if (loading && !weddingDetails) return <div className="loading-spinner">Yükleniyor...</div>;

    const assignedGuestCount = guests.filter(g => g.table_id).length;

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SeatingChartLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                totalGuests={weddingDetails?.total_guests || 0}
                assignedGuests={assignedGuestCount}
                onAddTable={() => setShowAddTableModal(true)}
                onAddGuest={() => setShowAddGuestModal(true)}
                onExportPdf={handlePdfExport}
                onEditDetails={handleEditDetails}
                hasData={tables.length > 0 && guests.length > 0}
            >
                {activeTab === 'schema' && (
                    <SchemaView
                        tables={tables}
                        guests={guests}
                        onAddGuest={() => setShowAddGuestModal(true)}
                        onDeleteTable={handleDeleteTable}
                    />
                )}
                {activeTab === 'tables' && (
                    <TableList tables={tables} onDelete={handleDeleteTable} />
                )}
                {activeTab === 'guests' && (
                    <GuestList guests={guests} tables={tables} onDelete={handleDeleteGuest} />
                )}
                {activeTab === 'spreadsheet' && (
                    <SpreadsheetView guests={guests} tables={tables} />
                )}
            </SeatingChartLayout>

            {showInitialModal && (
                <InitialSetupModal
                    onSave={handleInitialSave}
                    initialData={weddingDetails}
                />
            )}

            {showAddTableModal && (
                <AddTableModal
                    onClose={() => setShowAddTableModal(false)}
                    onSave={handleAddTable}
                />
            )}

            {showAddGuestModal && (
                <AddGuestModal
                    tables={tables}
                    onClose={() => setShowAddGuestModal(false)}
                    onSave={handleAddGuest}
                />
            )}

            <DragOverlay>
                {activeDragId ? (
                    <div className="drag-preview">
                        {/* Render preview based on type */}
                        Dragging...
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default SeatingChart;
