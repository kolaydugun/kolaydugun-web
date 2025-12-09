import { useEffect } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const FaviconManager = () => {
    const { settings } = useSiteSettings() || { settings: {} };

    useEffect(() => {
        if (settings?.favicon_url) {
            const link = document.querySelector("link[rel~='icon']");
            if (!link) {
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                document.head.appendChild(newLink);
                newLink.href = settings.favicon_url;
            } else {
                link.href = settings.favicon_url;
            }
        }
    }, [settings?.favicon_url]);

    return null; // This component doesn't render anything visible
};

export default FaviconManager;
