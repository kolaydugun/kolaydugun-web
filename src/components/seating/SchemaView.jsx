import React, { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

// Draggable Guest Item
const DraggableGuest = ({ guest }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: guest.id,
        data: { type: 'guest', guest }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="guest-list-item">
            <span>{guest.name}</span>
            {guest.plus_ones > 0 && <span className="badge">+{guest.plus_ones}</span>}
        </div>
    );
};

// Droppable Seat
const Seat = ({ seatIndex, guest, tableId }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `seat-${tableId}-${seatIndex}`,
        data: { type: 'seat', tableId, seatIndex }
    });

    return (
        <div
            ref={setNodeRef}
            className={`seat ${guest ? 'occupied' : ''} ${isOver ? 'highlight' : ''}`}
            style={{
                top: '50%', // Placeholder positioning, needs real math based on shape
                left: '50%',
                transform: `translate(-50%, -50%) rotate(${seatIndex * 45}deg) translate(40px) rotate(-${seatIndex * 45}deg)` // Example for round
            }}
            title={guest ? guest.name : `Koltuk ${seatIndex + 1}`}
        >
            {guest ? (guest.name.charAt(0) + (guest.plus_ones > 0 ? '+' : '')) : (seatIndex + 1)}
        </div>
    );
};

// Table Component on Canvas
const CanvasTable = ({ table, guests, onDelete }) => {
    const { t } = useTranslation();
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: table.id,
        data: { type: 'table', table }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        left: table.x || 100,
        top: table.y || 100,
        position: 'absolute'
    };

    // Calculate seat positions based on shape
    const renderSeats = () => {
        const seats = [];
        const tableGuests = guests.filter(g => g.table_id === table.id);
        const isRound = table.type === 'round';
        const width = isRound ? 100 : (table.type === 'rectangle' ? 160 : 100);
        const height = isRound ? 100 : 100;

        for (let i = 0; i < table.capacity; i++) {
            const guest = tableGuests.find(g => g.seat_index === i + 1);
            let x, y;

            if (isRound) {
                const angle = (i / table.capacity) * 2 * Math.PI;
                const radius = 60;
                x = Math.cos(angle) * radius;
                y = Math.sin(angle) * radius;
            } else {
                // Rectangle/Square logic: Distribute around perimeter
                const perimeter = 2 * (width + height);
                const step = perimeter / table.capacity;
                const pos = i * step;

                if (pos < width) { // Top
                    x = pos - width / 2;
                    y = -height / 2 - 20;
                } else if (pos < width + height) { // Right
                    x = width / 2 + 20;
                    y = (pos - width) - height / 2;
                } else if (pos < 2 * width + height) { // Bottom
                    x = (width - (pos - width - height)) - width / 2;
                    y = height / 2 + 20;
                } else { // Left
                    x = -width / 2 - 20;
                    y = (height - (pos - 2 * width - height)) - height / 2;
                }
            }

            seats.push(
                <div
                    key={i}
                    className={`seat ${guest ? 'occupied' : ''}`}
                    style={{
                        position: 'absolute',
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    {guest ? guest.name.charAt(0).toUpperCase() : (i + 1)}
                </div>
            );
        }
        return seats;
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="table-node group">
            <div className={`table-shape ${table.type}`} style={{
                width: table.type === 'rectangle' ? '160px' : '100px',
                height: '100px',
                borderRadius: table.type === 'round' ? '50%' : '8px',
                position: 'relative'
            }}>
                <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{table.name}</span>
                {renderSeats()}

                {/* Delete Button */}
                <button
                    className="delete-table-btn"
                    style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDelete(table.id);
                    }}
                    title={t('common.delete')}
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

const SchemaView = ({ tables, guests, onAddGuest, onDeleteTable }) => {
    const { t } = useTranslation();
    const unassignedGuests = guests.filter(g => !g.table_id);
    const [zoom, setZoom] = useState(1);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => setZoom(1);

    return (
        <div className="schema-layout">
            <div className="schema-sidebar">
                <h3>{t('seating_chart.unassigned_guests_title')}</h3>
                <button className="btn btn-secondary w-100 mb-3" onClick={onAddGuest}>
                    + {t('seating_chart.add_guest')}
                </button>

                <div className="unassigned-list">
                    {unassignedGuests.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                            {t('seating_chart.no_unassigned_guests')}
                        </p>
                    ) : (
                        unassignedGuests.map(guest => (
                            <DraggableGuest key={guest.id} guest={guest} />
                        ))
                    )}
                </div>
            </div>

            <div className="schema-canvas" style={{ overflow: 'hidden' }}>
                <div className="canvas-controls">
                    <button className="btn-icon" onClick={handleZoomIn}>🔍+</button>
                    <button className="btn-icon" onClick={handleZoomOut}>🔍-</button>
                    <button className="btn-icon" onClick={handleResetZoom}>⛶</button>
                </div>

                <div style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    width: '100%',
                    height: '100%',
                    position: 'relative'
                }}>
                    {tables.map(table => (
                        <CanvasTable
                            key={table.id}
                            table={table}
                            guests={guests}
                            onDelete={onDeleteTable}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SchemaView;
