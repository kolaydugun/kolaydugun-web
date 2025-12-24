import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music, Check, X, Clock, Loader2, ChevronLeft, QrCode, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LiveFeed = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvent();
        fetchRequests();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`live_requests_${eventId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'live_requests',
                filter: `event_id=eq.${eventId}`
            }, (payload) => {
                setRequests(prev => [payload.new, ...prev]);
                // Visual vibration/haptic for mobile if supported
                if ('vibrate' in navigator) navigator.vibrate(200);
                console.log('New request received!', payload.new);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'live_requests',
                filter: `event_id=eq.${eventId}`
            }, (payload) => {
                setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventId]);

    const fetchEvent = async () => {
        const { data, error: err } = await supabase
            .from('live_events')
            .select('*')
            .eq('id', eventId)
            .single();
        if (err) setError(err.message);
        setEvent(data);
    };

    const fetchRequests = async () => {
        try {
            const { data, error: err } = await supabase
                .from('live_requests')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: false });

            if (err) throw err;
            setRequests(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id, status) => {
        try {
            const { error: err } = await supabase
                .from('live_requests')
                .update({ status })
                .eq('id', id);
            if (err) throw err;
        } catch (err) {
            alert('Hata: ' + err.message);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="w-10 h-10 animate-spin text-prime" /></div>;

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const playedRequests = requests.filter(r => r.status === 'played');

    return (
        <div className="flex flex-col h-screen bg-black text-white selection:bg-prime selection:text-white">
            {/* High-Contrast Header */}
            <header className="px-6 py-5 bg-slate-900/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link to="/dashboard" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black tracking-tight">{event?.event_name}</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                            <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">{pendingRequests.length} BEKLEYEN İSTEK</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => {
                        const url = `${window.location.origin}/e/${event?.slug}`;
                        navigator.clipboard.writeText(url);
                        alert('Link kopyalandı!');
                    }}
                    className="p-3 bg-prime/10 border border-prime/20 rounded-2xl flex items-center gap-2"
                >
                    <QrCode className="w-5 h-5 text-prime" />
                    <span className="text-xs font-black text-prime hidden sm:inline tracking-widest">QR LINK</span>
                </button>
            </header>

            {/* Extreme Glanceability List */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {pendingRequests.length === 0 && (
                    <div className="text-center py-32 flex flex-col items-center justify-center opacity-20">
                        <Music className="w-24 h-24 mb-6" />
                        <p className="text-sm font-black uppercase tracking-[0.3em]">HENÜZ İSTEK YOK</p>
                    </div>
                )}

                <AnimatePresence mode="popLayout" initial={false}>
                    {pendingRequests.map((req) => (
                        <motion.div
                            layout
                            key={req.id}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 100 }}
                            className="bg-slate-900 border-2 border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
                        >
                            <div className="p-8 md:p-10">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-prime">
                                            <MessageSquare className="w-4 h-4 fill-prime/20" />
                                            <span className="text-xs font-black uppercase tracking-[0.1em]">{req.requester_name || 'MİSAFİR'}</span>
                                        </div>
                                        <span className="text-xs font-mono text-white/30 font-bold">
                                            {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4 text-white">
                                        {req.song_title}
                                    </h3>
                                    {req.note && (
                                        <div className="bg-white/5 border border-white/5 p-5 rounded-3xl mt-4">
                                            <p className="text-lg md:text-xl font-medium text-white/70 italic leading-relaxed">
                                                "{req.note}"
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Jumbo Control Buttons */}
                                <div className="grid grid-cols-2 gap-4 mt-10">
                                    <button
                                        onClick={() => updateRequestStatus(req.id, 'played')}
                                        className="flex flex-col items-center justify-center gap-2 py-8 bg-green-500 hover:bg-green-400 text-black rounded-[2rem] shadow-[0_10px_40px_rgba(34,197,94,0.3)] active:scale-95 transition-all"
                                    >
                                        <Check className="w-10 h-10 stroke-[3]" />
                                        <span className="text-sm font-black tracking-widest leading-none">ÇALDIN</span>
                                    </button>
                                    <button
                                        onClick={() => updateRequestStatus(req.id, 'rejected')}
                                        className="flex flex-col items-center justify-center gap-2 py-8 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 border-2 border-white/5 rounded-[2rem] active:scale-95 transition-all"
                                    >
                                        <X className="w-10 h-10 stroke-[3]" />
                                        <span className="text-sm font-black tracking-widest leading-none">REDDET</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Muted History Section */}
                {playedRequests.length > 0 && (
                    <div className="pt-12 pb-6">
                        <div className="flex items-center gap-6 text-white/10 uppercase tracking-[0.4em] font-black text-[10px]">
                            <div className="h-px bg-white/5 flex-1"></div>
                            <span>ÇALINANLAR ({playedRequests.length})</span>
                            <div className="h-px bg-white/5 flex-1"></div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-12">
                    {playedRequests.map((req) => (
                        <div key={req.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Music className="w-4 h-4 text-white/30" />
                                </div>
                                <div className="truncate">
                                    <p className="text-sm font-bold text-white/60 truncate">{req.song_title}</p>
                                    <p className="text-[10px] text-white/20 font-black tracking-tight">{req.requester_name}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateRequestStatus(req.id, 'pending')}
                                className="p-3 hover:bg-prime/10 rounded-2xl group-hover:text-prime transition-all text-white/20"
                            >
                                <Clock className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* Visual Indicator for New Requests when scrolled down */}
            {pendingRequests.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="bg-prime text-white px-6 py-3 rounded-full font-black text-xs tracking-widest shadow-2xl flex items-center gap-3 animate-bounce">
                        <Music className="w-4 h-4 animate-pulse" />
                        YENİ İSTEKLER VAR
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveFeed;
