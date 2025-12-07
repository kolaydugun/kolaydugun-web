import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useLanguage } from '../../context/LanguageContext';

const ContentRepurposer = ({ isOpen, onClose, postData }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [activeTab, setActiveTab] = useState('instagram'); // instagram, linkedin, newsletter

    if (!isOpen) return null;

    const handleRepurpose = async () => {
        setLoading(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
            if (!apiKey) throw new Error("API Key eksik.");

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const contentToProcess = `
                Title: ${postData.title?.tr || postData.title}
                Content: ${postData.content?.tr || postData.content}
                Excerpt: ${postData.excerpt?.tr || postData.excerpt}
            `;

            const prompt = `
                You are a professional social media manager and content strategist. 
                Repurpose the following blog post content into 3 distinct formats for Turkish audience.

                BLOG CONTENT:
                ${contentToProcess}

                REQUIRED OUTPUT (JSON FORMAT):
                {
                    "instagram": "Engaging caption with emojis, hook, value proposition, call to action, and 15-20 relevant hashtags. Casual and visual tone.",
                    "linkedin": "Professional post focusing on industry insights, tips, or business value. Professional tone, minimal emojis, 3-5 hashtags.",
                    "newsletter": "HTML formatted email summary. Subject line + Body. Catchy subject, personal tone, 'Read more' link placeholder."
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const resultData = JSON.parse(cleanJson);

            setGeneratedContent(resultData);

        } catch (error) {
            console.error("Repurpose Error:", error);
            alert("İçerik dönüştürülemedi: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Kopyalandı!');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>🪄 İçerik Sihirbazı (Repurposer)</h3>
                    <button onClick={onClose} className="btn-close">×</button>
                </div>

                {!generatedContent && !loading && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🧙‍♂️</div>
                        <h4>Blog yazınızı diğer platformlara uyarlayayım mı?</h4>
                        <p style={{ color: '#666', marginBottom: '30px' }}>
                            Yazdığınız bloğu tek tıkla Instagram postuna, LinkedIn makalesine ve E-Bültene dönüştürebilirim.
                        </p>
                        <button
                            onClick={handleRepurpose}
                            className="btn btn-primary"
                            style={{ padding: '12px 30px', fontSize: '16px', background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)' }}
                        >
                            ✨ Sihiri Başlat
                        </button>
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 20px', border: '4px solid #f3f3f3', borderTop: '4px solid #4ECDC4', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite' }}></div>
                        <p>İçerik analiz ediliyor ve dönüştürülüyor...</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}

                {generatedContent && (
                    <div className="repurpose-results" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <button
                                onClick={() => setActiveTab('instagram')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: activeTab === 'instagram' ? '#E1306C' : '#f0f0f0',
                                    color: activeTab === 'instagram' ? 'white' : '#333',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                📸 Instagram
                            </button>
                            <button
                                onClick={() => setActiveTab('linkedin')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: activeTab === 'linkedin' ? '#0077b5' : '#f0f0f0',
                                    color: activeTab === 'linkedin' ? 'white' : '#333',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                💼 LinkedIn
                            </button>
                            <button
                                onClick={() => setActiveTab('newsletter')}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: activeTab === 'newsletter' ? '#ff9900' : '#f0f0f0',
                                    color: activeTab === 'newsletter' ? 'white' : '#333',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                📧 E-Bülten
                            </button>
                        </div>

                        <div className="tab-content" style={{ flex: 1, overflowY: 'auto', padding: '10px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                                {generatedContent[activeTab]}
                            </pre>
                        </div>

                        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => copyToClipboard(generatedContent[activeTab])}
                                className="btn btn-secondary"
                            >
                                📋 Kopyala
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentRepurposer;
