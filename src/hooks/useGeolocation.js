import { useState, useEffect } from 'react';

/**
 * Custom hook for getting user's geolocation
 * @returns {Object} { location, loading, error, getLocation }
 */
const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Tarayıcınız konum özelliğini desteklemiyor.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setLoading(false);
            },
            (err) => {
                let errorMessage = 'Konum alınamadı.';

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Konum bilgisi kullanılamıyor.';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Konum alma zaman aşımına uğradı.';
                        break;
                    default:
                        errorMessage = 'Bilinmeyen bir hata oluştu.';
                }

                setError(errorMessage);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const clearLocation = () => {
        setLocation(null);
        setError(null);
    };

    return {
        location,
        loading,
        error,
        getLocation,
        clearLocation
    };
};

export default useGeolocation;
