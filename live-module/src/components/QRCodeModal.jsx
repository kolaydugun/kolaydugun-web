import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const QRCodeModal = ({ isOpen, onClose, url, eventName }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        console.log("Downloading QR V3 - Binary Force...");
        try {
            const container = document.getElementById('qr-code-canvas');
            const qrCanvas = container?.querySelector('canvas');

            if (!qrCanvas) {
                alert("Hata: QR Kod bulunamadı.");
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const padding = 60;
            const textSpace = 120;
            canvas.width = qrCanvas.width + (padding * 2);
            canvas.height = qrCanvas.height + padding + textSpace;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(qrCanvas, padding, padding);

            ctx.fillStyle = 'black';
            ctx.font = 'bold 28px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(eventName || 'Etkinlik', canvas.width / 2, qrCanvas.height + padding + 40);

            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(t('qrModal.scanText'), canvas.width / 2, qrCanvas.height + padding + 80);

            // Force octet-stream to help download managers recognize it as a file to be saved
            const pngData = canvas.toDataURL('image/png').replace("image/png", "application/octet-stream");

            const cleanName = (eventName || 'qr')
                .replace(/[^a-zA-Z0-9]/g, '')
                .substring(0, 20);

            const fileName = `qr_${cleanName || 'code'}.png`;

            const link = document.createElement('a');
            link.setAttribute('download', fileName);
            link.setAttribute('href', pngData);
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
            }, 1000);

        } catch (err) {
            console.error("QR Download Error:", err);
            alert("Hata: " + err.message);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass-card w-full max-w-sm rounded-[40px] p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-prime to-transparent opacity-50" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-white premium-text tracking-tight uppercase">{t('qrModal.title')}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all transform hover:rotate-90 duration-300"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div id="qr-code-canvas" className="bg-white p-8 rounded-[32px] mb-8 flex flex-col items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] group">
                                <QRCodeCanvas
                                    value={url}
                                    size={220}
                                    level="H"
                                    includeMargin={false}
                                />
                                <div className="mt-6 text-center">
                                    <p className="text-slate-900 font-black text-lg tracking-tight">{eventName}</p>
                                    <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mt-1">{t('qrModal.scanText')}</p>
                                </div>
                            </div>

                            <div className="mb-8 px-4">
                                <p className="text-center text-slate-400 text-xs leading-relaxed font-bold uppercase tracking-wide opacity-60">
                                    {t('qrModal.instruction')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center justify-center gap-2 py-5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    {copied ? t('qrModal.copied') : t('qrModal.copyButton')}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center justify-center gap-2 py-5 bg-prime hover:bg-rose-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(244,63,94,0.3)] active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    {t('qrModal.downloadButton')}
                                </button>
                            </div>

                            <p className="text-center text-slate-600 text-[9px] mt-8 font-black uppercase tracking-[0.4em] opacity-40">
                                {t('qrModal.footerText')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default QRCodeModal;
