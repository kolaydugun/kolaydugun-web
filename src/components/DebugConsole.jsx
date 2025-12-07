import React, { useState, useEffect } from 'react';

const DebugConsole = () => {
    const [logs, setLogs] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        const addLog = (type, args) => {
            const message = args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg, null, 2);
                    } catch (e) {
                        return String(arg);
                    }
                }
                return String(arg);
            }).join(' ');

            setLogs(prev => [...prev.slice(-49), { type, message, timestamp: new Date().toLocaleTimeString() }]);
        };

        console.log = (...args) => {
            addLog('LOG', args);
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            addLog('ERROR', args);
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            addLog('WARN', args);
            originalWarn.apply(console, args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    if (!isVisible) return <button onClick={() => setIsVisible(true)} style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 9999 }}>Show Debug</button>;

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: '400px',
            height: '300px',
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: '12px',
            overflowY: 'auto',
            zIndex: 9999,
            padding: '10px',
            borderTopLeftRadius: '10px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', borderBottom: '1px solid #333' }}>
                <strong>Debug Console</strong>
                <button onClick={() => setLogs([])} style={{ marginRight: '5px' }}>Clear</button>
                <button onClick={() => setIsVisible(false)}>Hide</button>
            </div>
            {logs.map((log, i) => (
                <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid #222' }}>
                    <span style={{ color: '#666' }}>[{log.timestamp}]</span>
                    <span style={{ color: log.type === 'ERROR' ? '#f55' : log.type === 'WARN' ? '#fa0' : '#0f0', fontWeight: 'bold', marginLeft: '5px' }}>
                        {log.type}:
                    </span>
                    <pre style={{ margin: '2px 0 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{log.message}</pre>
                </div>
            ))}
        </div>
    );
};

export default DebugConsole;
