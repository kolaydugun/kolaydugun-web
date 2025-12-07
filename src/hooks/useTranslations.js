import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { dictionary } from '../locales/dictionary';

export const useTranslations = () => {
    const [translations, setTranslations] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper to flatten dictionary for initial state
    const flattenDictionary = useCallback((dict) => {
        const flat = {};
        const traverse = (obj, path = []) => {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && !obj[key].en) {
                    traverse(obj[key], [...path, key]);
                } else if (typeof obj[key] === 'object' && obj[key].en) {
                    // It's a translation node
                    const flatKey = [...path, key].join('.');
                    flat[flatKey] = obj[key];
                } else if (typeof obj[key] === 'string') {
                    // Direct string (legacy support)
                    const flatKey = [...path, key].join('.');
                    flat[flatKey] = { en: obj[key], de: obj[key], tr: obj[key] };
                }
            }
        };
        traverse(dict);
        return flat;
    }, []);

    const fetchTranslations = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('translations')
                .select('*');

            if (error) throw error;

            // Start with local dictionary as base
            const merged = flattenDictionary(dictionary);

            // Override/Add from DB
            if (data) {
                data.forEach(item => {
                    merged[item.key] = {
                        en: item.en,
                        de: item.de,
                        tr: item.tr
                    };
                });
            }

            setTranslations(merged);
        } catch (err) {
            console.error('Error fetching translations:', err);
            setError(err);
            // Fallback to local dictionary on error
            setTranslations(flattenDictionary(dictionary));
        } finally {
            setLoading(false);
        }
    }, [flattenDictionary]);

    useEffect(() => {
        fetchTranslations();
    }, [fetchTranslations]);

    // Function to update a translation (for Admin UI)
    const updateTranslation = async (key, values) => {
        console.log('Updating translation:', { key, values });
        const { data, error } = await supabase
            .from('translations')
            .upsert({
                key,
                ...values,
                updated_at: new Date()
            })
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }
        console.log('Supabase update success:', data);

        // Update local state immediately
        setTranslations(prev => ({
            ...prev,
            [key]: { ...prev[key], ...values }
        }));
    };

    return { translations, loading, error, updateTranslation, refresh: fetchTranslations };
};
