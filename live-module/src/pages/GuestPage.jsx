import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Music, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { containsProfanity, filterProfanity } from '../utils/profanity';

const GuestPage = () => {
    const { slug } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [song, setSong] = useState('');
    const [note, setNote] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        fetchEvent();
    }, [slug]);

    const fetchEvent = async () => {
        try {
            const { data, error: err } = await supabase
                .from('live_events')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (err) throw err;
            if (data.is_closed) throw new Error('Bu etkinlik şu an istek kabul etmiyor.');

            setEvent(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Etkinlik bulunamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!song.trim()) return;

        // Basic cooldown check (local only for MVP)
        const lastSent = localStorage.getItem(`last_req_${slug}`);
        if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
            alert('Lütfen yeni bir istek için 1 dakika bekleyin.');
            return;
        }

        setSending(true);
        try {
            // 1. Check current request count vs limit
            const { count, error: countErr } = await supabase
                .from('live_requests')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', event.id);

            if (countErr) throw countErr;

            const limit = event.settings?.request_limit || 20;
            if (count >= limit) {
                throw new Error('Bu etkinlik için maksimum istek limitine ulaşıldı.');
            }

            // 2. Insert the request
            const { error: err } = await supabase
                .from('live_requests')
                .insert([{
                    event_id: event.id,
                    song_title: filterProfanity(song.trim()),
                    note: filterProfanity(note.trim()),
                    requester_name: filterProfanity(name.trim()) || 'Misafir',
                    status: 'pending'
                }]);

            if (err) throw err;

            setSubmitted(true);
            localStorage.setItem(`last_req_${slug}`, Date.now().toString());
        } catch (err) {
            alert('Hata: ' + err.message);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6">
                <Loader2 className="w-8 h-8 animate-spin text-prime" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <h1 className="text-xl font-bold mb-2">Hata</h1>
                <p className="text-slate-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-950 p-6">
            {/* Header */}
            <div className="text-center mb-8 pt-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-prime/10 rounded-full mb-4">
                    <Music className="w-8 h-8 text-prime" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">{event?.event_name}</h1>
                <p className="text-slate-500 text-sm mt-1">Şarkı isteğinizi DJ'e gönderin</p>
            </div>

            <AnimatePresence mode="wait">
                {!submitted ? (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Şarkı / Sanatçı</label>
                            <input
                                required
                                type="text"
                                placeholder="Örn: Ankara'nın Bağları"
                                value={song}
                                onChange={(e) => setSong(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-prime focus:border-transparent"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">İsminiz (Opsiyonel)</label>
                            <input
                                type="text"
                                placeholder="İsminizi yazın"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-slate-700"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Kısa Not (Opsiyonel)</label>
                            <textarea
                                placeholder="Örn: Damat beye gelsin!"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-slate-700 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-prime hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-prime/20 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            İSTEĞİ GÖNDER
                        </button>
                    </motion.form>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12"
                    >
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold">Harika!</h2>
                        <p className="text-slate-400">Şarkı isteğin başarıyla DJ'e iletildi. İyi eğlenceler!</p>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setSong('');
                                setNote('');
                            }}
                            className="text-prime font-bold text-sm uppercase tracking-widest pt-4"
                        >
                            YENİ BİR İSTEK GÖNDER
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="mt-auto py-8 text-center text-[10px] text-slate-600 font-medium uppercase tracking-[0.2em]">
                Powered by KolayDüğün Live
            </footer>
        </div>
    );
};

export default GuestPage;
