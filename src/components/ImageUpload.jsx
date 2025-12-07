import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

const ImageUpload = ({ onUploadComplete, currentImageUrl = '', folder = 'blog' }) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImageUrl);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Lütfen bir resim dosyası seçin');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Dosya boyutu 5MB\'dan küçük olmalıdır');
            return;
        }

        setUploading(true);

        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            setPreview(publicUrl);
            onUploadComplete(publicUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Yükleme hatası: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="image-upload-container">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
            />

            {preview ? (
                <div style={{ position: 'relative' }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            width: '100%',
                            maxHeight: '300px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '10px'
                        }}
                    />
                    <button
                        onClick={() => {
                            setPreview('');
                            onUploadComplete('');
                        }}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            fontSize: '18px'
                        }}
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleButtonClick}
                    style={{
                        border: dragActive ? '2px dashed #3b82f6' : '2px dashed #d1d5db',
                        borderRadius: '8px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: dragActive ? '#eff6ff' : '#f9fafb',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {uploading ? (
                        <div>
                            <div className="loading-spinner" style={{ margin: '0 auto 10px' }}></div>
                            <p style={{ color: '#666' }}>Yükleniyor...</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                            <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '5px', color: '#374151' }}>
                                Resim yüklemek için tıklayın veya sürükleyin
                            </p>
                            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                                PNG, JPG, GIF (max 5MB)
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
