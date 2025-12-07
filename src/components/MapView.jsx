import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import './MapView.css';

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ latitude, longitude, businessName, address }) => {
    const { t } = useLanguage();

    if (!latitude || !longitude) {
        return null;
    }

    const position = [latitude, longitude];

    const handleGetDirections = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, '_blank');
    };

    return (
        <div className="map-view-container">
            <div className="map-header">
                <h3>📍 {t('map.location')}</h3>
                {address && <p className="map-address">{address}</p>}
                <button
                    className="btn btn-primary btn-sm get-directions-btn"
                    onClick={handleGetDirections}
                >
                    🧭 {t('map.getDirections')}
                </button>
            </div>

            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                className="leaflet-map"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        <strong>{businessName}</strong>
                        {address && <><br />{address}</>}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapView;
