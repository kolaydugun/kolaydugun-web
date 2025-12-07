/**
 * Geolocation utility functions
 * Haversine formula for calculating distance between two GPS coordinates
 */

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => degrees * (Math.PI / 180);

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Format distance for display
 * @param {number} km - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (km) => {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
};

/**
 * Check if distance is within radius
 * @param {number} distance - Distance in kilometers
 * @param {number} radius - Radius in kilometers
 * @returns {boolean} True if within radius
 */
export const isWithinRadius = (distance, radius) => {
    if (!radius) return true; // No radius filter
    return distance <= radius;
};

/**
 * Validate GPS coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if valid coordinates
 */
export const isValidCoordinates = (lat, lon) => {
    return (
        typeof lat === 'number' &&
        typeof lon === 'number' &&
        lat >= -90 && lat <= 90 &&
        lon >= -180 && lon <= 180
    );
};
