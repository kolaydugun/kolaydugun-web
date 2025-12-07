import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Maintenance from '../pages/Maintenance';

const MaintenanceCheck = () => {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user, role } = useAuth();
    const location = useLocation();

    useEffect(() => {
        checkMaintenance();
    }, [location.pathname]); // Re-check on route change

    const checkMaintenance = async () => {
        try {
            const { data, error } = await supabase
                .from('marketplace_config')
                .select('value')
                .eq('key', 'maintenance_mode')
                .single();

            if (data && data.value === 'true') {
                setIsMaintenance(true);
            } else {
                setIsMaintenance(false);
            }
        } catch (err) {
            console.error('Error checking maintenance mode:', err);
        } finally {
            setLoading(false);
        }
    };

    // If loading, don't block (or show spinner if critical)
    if (loading) return null;

    // If maintenance mode is active
    if (isMaintenance) {
        // Allow admins to bypass
        if (role === 'admin') return null;

        // Allow login page to access admin
        if (location.pathname === '/login') return null;

        // Block everything else
        return (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, background: 'white' }}>
                <Maintenance />
            </div>
        );
    }

    return null;
};

export default MaintenanceCheck;
