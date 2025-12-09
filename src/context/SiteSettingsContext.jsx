import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
    return useContext(SiteSettingsContext);
};

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        hero_title: { en: '', de: '', tr: '' },
        hero_subtitle: { en: '', de: '', tr: '' },
        hero_image_url: '',
        social_media: {},
        og_image_url: '' // New setting
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .single();

            if (!error && data) {
                setSettings({
                    hero_title: data.hero_title || { en: '', de: '', tr: '' },
                    hero_subtitle: data.hero_subtitle || { en: '', de: '', tr: '' },
                    hero_image_url: data.hero_image_url || '',
                    social_media: data.social_media || {},
                    og_image_url: data.og_image_url || ''
                });
            }
        } catch (error) {
            console.error('Error fetching site settings:', error);
        } finally {
            // We set loading to false even on error so app doesn't hang
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Exposed value
    const value = {
        settings,
        loading,
        refreshSettings: fetchSettings
    };

    return (
        <SiteSettingsContext.Provider value={value}>
            {children}
        </SiteSettingsContext.Provider>
    );
};
