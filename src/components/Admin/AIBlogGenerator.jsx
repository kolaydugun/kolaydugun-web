import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useLanguage } from '../../context/LanguageContext';

const AIBlogGenerator = ({ onGenerate, onClose }) => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('input'); // input, generating, review
    const [view, setView] = useState('ideas'); // ideas, form

    // Model selection state
    const [availableModels, setAvailableModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState("");
    const [modelLoading, setModelLoading] = useState(true);

    // Idea Generator State
    const [ideaCategory, setIdeaCategory] = useState('');
    const [generatedIdeas, setGeneratedIdeas] = useState([]);
    const [ideasLoading, setIdeasLoading] = useState(false);

    // Input Form State
    const [formData, setFormData] = useState({
        topic: '',
        targetAudience: 'Couples planning their wedding',
        tone: 'friendly', // friendly, formal, expert
        length: 'medium', // short, medium, long
        language: 'de', // Primary language for generation
        instructions: ''
    });

    const [includeAffiliateLinks, setIncludeAffiliateLinks] = useState(false);

    const ideaCategories = [
        "Genel", "Düğün Planlaması", "Gelin Hazırlığı", "Damat Rehberi",
        "Mekan Seçimi", "Dekorasyon Fikirleri", "Düğün Bütçesi",
        "Balayı Rehberi", "Güzellik ve Bakım", "Düğün Fotoğrafları", "Müzik ve Eğlence"
    ];

    // Custom API Key State
    const [customApiKey, setCustomApiKey] = useState('');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('admin_gemini_api_key');
        if (storedKey) setCustomApiKey(storedKey);
    }, []);

    const getApiKey = () => {
        return customApiKey?.trim() || import.meta.env.VITE_GEMINI_API_KEY?.trim();
    };

    const handleSaveApiKey = () => {
        if (!customApiKey.trim()) {
            localStorage.removeItem('admin_gemini_api_key');
            alert('Varsayılan anahtara dönüldü.');
        } else {
            localStorage.setItem('admin_gemini_api_key', customApiKey.trim());
            alert('Özel anahtar kaydedildi ve aktif hale getirildi.');
        }
        setShowApiKeyInput(false);
        // Reload models with new key
        setModelLoading(true);
        fetchModels();
    };

    const fetchModels = async () => {
        const apiKey = getApiKey();
        if (!apiKey) return;

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await res.json();

            if (data.models) {
                const contentModels = data.models
                    .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
                    .map(m => m.name.replace("models/", ""));

                setAvailableModels(contentModels);

                // Auto-select logic:
                // 1. If currently selected is valid, keep it.
                // 2. Else if generic preferences exist, pick them.
                // 3. Fallback to first available.
                const isValid = selectedModel && contentModels.includes(selectedModel);

                if (!isValid && contentModels.length > 0) {
                    if (contentModels.includes("gemini-1.5-flash")) setSelectedModel("gemini-1.5-flash");
                    else if (contentModels.includes("gemini-2.0-flash-exp")) setSelectedModel("gemini-2.0-flash-exp");
                    else if (contentModels.includes("gemini-1.5-pro")) setSelectedModel("gemini-1.5-pro");
                    else if (contentModels.includes("gemini-pro")) setSelectedModel("gemini-pro");
                    else setSelectedModel(contentModels[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch models:", error);
        } finally {
            setModelLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, [customApiKey]); // Re-fetch when key changes

    const handleIdeaGenerate = async () => {
        setIdeasLoading(true);
        setGeneratedIdeas([]);
        try {
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("API Key eksik (.env veya Özel Anahtar).");

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: selectedModel });

            const prompt = `
                Sen uzman bir düğün editörüsün. "${ideaCategory || 'Genel'}" kategorisinde, 
                Türk çiftlerin ilgisini çekecek, SEO uyumlu ve tıklanabilir 5 harika blog yazısı fikri öner.
                
                Her fikir için şunları JSON formatında ver:
                [
                    {
                        "topic": "Dikkat Çekici Başlık",
                        "target_audience": "Örn: Bütçesi kısıtlı çiftler",
                        "instructions": "Örn: Liste formatında olsun, tasarruf ipuçlarına odaklan."
                    }
                ]
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log('Raw Idea Response:', text); // Debug log

            // Find JSON array in the response
            const match = text.match(/\[[\s\S]*\]/);
            if (!match) throw new Error("JSON dizisi bulunamadı.");

            const cleanJson = match[0];
            const ideas = JSON.parse(cleanJson);

            if (Array.isArray(ideas)) {
                setGeneratedIdeas(ideas);
            } else {
                throw new Error("Format hatası: Dizi değil");
            }

        } catch (error) {
            console.error("Idea Gen Error:", error);
            alert("Fikir üretilemedi: " + error.message);
        } finally {
            setIdeasLoading(false);
        }
    };

    const selectIdea = (idea) => {
        setFormData(prev => ({
            ...prev,
            topic: idea.topic,
            targetAudience: idea.target_audience || prev.targetAudience,
            instructions: idea.instructions || ''
        }));
        setView('form');
        setStep('input');
    };

    const [showAdvanced, setShowAdvanced] = useState(false); // NEW: Toggle state

    const handleGenerate = async () => {
        if (!formData.topic) return alert('Lütfen bir konu girin.');

        setLoading(true);
        setStep('generating');

        try {
            const apiKey = getApiKey();

            if (!apiKey) {
                throw new Error("API Key bulunamadı (.env veya Özel Anahtar).");
            }

            console.log("Using Selected Model:", selectedModel);
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: selectedModel });

            const prompt = `
                You are an expert wedding blog writer. Write a blog post about "${formData.topic}".
                Target Audience: ${formData.targetAudience || 'Analyze the topic and determine the best target audience automatically.'}
                Tone: ${formData.tone}
                Length: ${formData.length} (short: ~500 words, medium: ~1000 words, long: ~2000 words)
                Additional Instructions: ${formData.instructions || 'None. Optimize content for best engagement and SEO.'}

                REQUIRED OUTPUT FORMAT:
                You must return a SINGLE valid JSON object. Do not include markdown formatting like \`\`\`json.
                The JSON must have this exact structure:
                {
                    "tr": "HTML content in Turkish (use <h1>, <h2>, <p> tags)",
                    "en": "HTML content in English",
                    "de": "HTML content in German",
                    "meta_title": {
                        "tr": "SEO Title TR",
                        "en": "SEO Title EN",
                        "de": "SEO Title DE"
                    },
                    "meta_description": {
                        "tr": "SEO Description TR",
                        "en": "SEO Description EN",
                        "de": "SEO Description DE"
                    },
                    "excerpt": {
                        "tr": "Short summary TR (approx 2 sentences)",
                        "en": "Short summary EN (approx 2 sentences)",
                        "de": "Short summary DE (approx 2 sentences)"
                    },
                    "tags": ["Tag1", "Tag2", "Tag3"],
                    "image_generation_prompt": "A highly detailed, cinematic prompt for generating a cover image...",
                    "image_search_keywords": ["keyword1", "keyword2", "keyword3"]${includeAffiliateLinks ? `,
                    "slots": [
                        {
                            "id": "SLOT_UNIQUE_ID",
                            "context_summary": "Brief description of where this product fits",
                            "suggested_product_type": "Type of product to recommend",
                            "search_keywords": {
                                "tr": ["keyword1", "keyword2"],
                                "en": ["keyword1", "keyword2"],
                                "de": ["keyword1", "keyword2"]
                            }
                        }
                    ]` : ''}
                }

                CONTENT GUIDELINES:
                1. Write high-quality, engaging content.
                2. ${includeAffiliateLinks ? 'Include 2-3 natural opportunities for product recommendations.' : 'Focus on pure information and engagement.'}
                3. ${includeAffiliateLinks ? 'In the HTML content, insert placeholders like {{SLOT_UNIQUE_ID}} where the product link should go.' : 'Do not include any product placeholders.'}
                4. Ensure all 3 languages correspond to each other loosely (same structure).
                5. For "image_search_keywords", provide 3-5 high quality, ENGLIGH search terms that would find good stock photos for this blog post on Unsplash.
                6. For "tags", provide 3-5 relevant short tags (e.g. "Wedding Planning", "Budget", "Decoration") in English.
                7. For "image_generation_prompt", write a detailed, high-quality prompt (in English) that the user can copy and paste into Midjourney or DALL-E to generate a perfect featured image.
            `;

            console.log('Sending prompt to Gemini...');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('Raw AI Response:', text);

            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiResponse = JSON.parse(cleanJson);

            onGenerate(aiResponse);
            onClose();
            alert('✅ İçerik başarıyla oluşturuldu!');

        } catch (error) {
            console.error('Generation error:', error);
            alert('Hata: ' + (error.message || 'Yapay zeka yanıtı işlenemedi.'));
            setStep('input');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>🤖 AI İçerik Asistanı</h3>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            className="btn-api-settings"
                            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '20px',
                                cursor: 'pointer',
                                opacity: customApiKey ? 1 : 0.6,
                                padding: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="API Anahtarı Ayarları"
                        >
                            {customApiKey ? '🔑' : '⚙️'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={onClose} className="btn-close">×</button>
                    </div>
                </div>

                {showApiKeyInput && (
                    <div style={{ background: '#fff3cd', padding: '10px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #ffeeba' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
                            Özel Gizli API Anahtarı (Opsiyonel)
                        </label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Varsayılan anahtarı kullanmak için boş bırakın..."
                                value={customApiKey}
                                onChange={(e) => setCustomApiKey(e.target.value)}
                                style={{ fontSize: '13px' }}
                            />
                            <button className="btn btn-sm btn-primary" onClick={handleSaveApiKey}>Kaydet</button>
                        </div>
                        <small style={{ fontSize: '11px', color: '#666' }}>
                            {customApiKey ? '✅ Özel anahtar kullanılıyor.' : 'ℹ️ Varsayılan sistem anahtarı aktif.'}
                            {' '}Bu anahtar sadece sizin tarayıcınızda saklanır.
                        </small>
                    </div>
                )}

                <div className="form-group" style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Aktif Zeka Modeli:</label>
                    {modelLoading ? (
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>Yükleniyor...</span>
                    ) : (
                        <select
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: '13px', height: 'auto', marginTop: '5px' }}
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            {availableModels.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    )}
                </div>

                {view === 'ideas' && (
                    <div className="idea-generator-view">
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h4>Ne hakkında yazmak istersin?</h4>
                            <p style={{ color: '#666' }}>Bir kategori seç, yapay zeka sana konu fikirleri versin.</p>
                        </div>

                        <div className="form-group">
                            <label>Kategori (Opsiyonel)</label>
                            <select
                                className="form-control"
                                value={ideaCategory}
                                onChange={(e) => setIdeaCategory(e.target.value)}
                            >
                                <option value="">Rastgele / Genel</option>
                                {ideaCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleIdeaGenerate}
                            disabled={ideasLoading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'linear-gradient(45deg, #10b981, #3b82f6)',
                                border: 'none',
                                fontWeight: 'bold',
                                marginBottom: '20px'
                            }}
                        >
                            {ideasLoading ? 'Fikirler Üretiliyor...' : '💡 Bana 5 Harika Fikir Bul'}
                        </button>

                        {generatedIdeas.length > 0 && (
                            <div className="idea-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label>Senin için Seçtiklerim:</label>
                                {generatedIdeas.map((idea, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => selectIdea(idea)}
                                        className="idea-card"
                                        style={{
                                            textAlign: 'left',
                                            padding: '15px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            background: 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontSize: '15px'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'}
                                        onMouseOut={e => e.currentTarget.style.borderColor = '#ddd'}
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>✨ {idea.topic}</div>
                                        <div style={{ fontSize: '13px', color: '#666' }}>🎯 {idea.target_audience}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', textAlign: 'center' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setFormData({ ...formData, topic: '', targetAudience: '', instructions: '' });
                                    setView('form');
                                    setStep('input');
                                }}
                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', background: 'white' }}
                            >
                                ✍️ Zaten bir konum var, kendim gireceğim
                            </button>
                        </div>
                    </div>
                )}

                {view === 'form' && step === 'input' && (
                    <div className="ai-form">
                        <div style={{ marginBottom: '15px' }}>
                            <button
                                onClick={() => setView('ideas')}
                                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0 }}
                            >
                                &larr; Fikirler'e Dön
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Blog Konusu</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Örn: Rustik Düğün Masa Dekorasyonu"
                                value={formData.topic}
                                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    checked={includeAffiliateLinks}
                                    onChange={(e) => setIncludeAffiliateLinks(e.target.checked)}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span>💲 Affiliate Linkleri Ekle (Ürün Önerileri)</span>
                            </label>
                            <small style={{ display: 'block', color: '#666', marginLeft: '28px' }}>
                                İşaretlenirse yapay zeka içerik içine ürün yerleştirmeleri ekler.
                            </small>
                        </div>

                        {/* Simplified View: Hide details unless requested */}
                        <div style={{ marginBottom: '15px' }}>
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                                {showAdvanced ? '🔽 Gelişmiş Ayarları Gizle' : '▶️ Gelişmiş Ayarları Göster (Hedef Kitle, Ton vb.)'}
                            </button>
                        </div>

                        {showAdvanced && (
                            <>
                                <div className="form-group">
                                    <label>Hedef Kitle</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.targetAudience}
                                        onChange={e => setFormData({ ...formData, targetAudience: e.target.value })}
                                        placeholder="Boş bırakırsanız yapay zeka belirler"
                                    />
                                </div>

                                <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Ton</label>
                                        <select
                                            className="form-control"
                                            value={formData.tone}
                                            onChange={e => setFormData({ ...formData, tone: e.target.value })}
                                        >
                                            <option value="friendly">Samimi & Arkadaşça</option>
                                            <option value="formal">Resmi & Kurumsal</option>
                                            <option value="expert">Uzman & Bilgilendirici</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Uzunluk</label>
                                        <select
                                            className="form-control"
                                            value={formData.length}
                                            onChange={e => setFormData({ ...formData, length: e.target.value })}
                                        >
                                            <option value="short">Kısa (~500 kelime)</option>
                                            <option value="medium">Orta (~1000 kelime)</option>
                                            <option value="long">Uzun (~2000 kelime)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Ek Talimatlar (Opsiyonel)</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Örn: Özellikle dış mekan düğünlerine odaklan..."
                                        value={formData.instructions}
                                        onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                                    ></textarea>
                                </div>
                            </>
                        )}

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={onClose}>İptal</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerate}
                                disabled={!formData.topic}
                                style={{ background: 'linear-gradient(45deg, #4f46e5, #9333ea)', border: 'none' }}
                            >
                                ✨ Oluştur
                            </button>
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 20px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
                        <h4>Yapay Zeka Blog Yazıyor...</h4>
                        <p style={{ color: '#666' }}>Seçili Model: <b>{selectedModel}</b></p>
                        <p style={{ color: '#666', fontSize: '0.9em' }}>İçerik analiz ediliyor, 3 dilde yazılıyor...</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIBlogGenerator;
