import React from 'react';
import { useSessionTracking } from '../hooks/useSessionTracking';

const SessionTracker = () => {
    useSessionTracking();
    return null; // This component renders nothing, just runs the hook
};

export default SessionTracker;
