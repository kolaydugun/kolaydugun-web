import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import './VendorImportModal.css';

const VendorImportModal = ({ onClose, onImported }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            const data = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                // Simple CSV parser that handles quotes
                const row = [];
                let inQuote = false;
                let currentCell = '';

                for (let char of lines[i]) {
                    if (char === '"') {
                        inQuote = !inQuote;
                    } else if (char === ',' && !inQuote) {
                        row.push(currentCell.trim());
                        currentCell = '';
                    } else {
                        currentCell += char;
                    }
                }
                row.push(currentCell.trim());

                if (row.length === headers.length) {
                    const obj = {};
                    headers.forEach((header, index) => {
                        // Map CSV headers to DB columns
                        const key = mapHeaderToKey(header);
                        if (key) obj[key] = row[index].replace(/^"|"$/g, ''); // Remove surrounding quotes
                    });
                    data.push(obj);
                }
            }
            setPreview(data);
        };
        reader.readAsText(file);
    };

    const mapHeaderToKey = (header) => {
        const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
        const mapping = {
            'businessname': 'business_name',
            'name': 'business_name',
            'category': 'category',
            'city': 'city',
            'description': 'description',
            'instagram': 'instagram_url',
            'instagramurl': 'instagram_url',
            'website': 'website_url',
            'websiteurl': 'website_url',
            'phone': 'phone',
            'email': 'email'
        };
        return mapping[h] || h;
    };

    const handleImport = async () => {
        setLoading(true);
        setError(null);

        try {
            // Prepare data for insertion
            const vendorsToInsert = preview.map(row => {
                // Construct social_media JSON
                const social_media = {};
                if (row.instagram_url) social_media.instagram = row.instagram_url;
                if (row.website_url) social_media.website = row.website_url;

                // Create clean object for insertion
                const { instagram_url, ...cleanRow } = row;

                return {
                    id: crypto.randomUUID(), // Generate ID client-side
                    ...cleanRow,
                    social_media, // Add social_media JSON
                    subscription_tier: 'free',
                    created_at: new Date().toISOString()
                };
            });

            const { data, error } = await supabase
                .from('vendors')
                .insert(vendorsToInsert)
                .select();

            if (error) throw error;

            setSuccess(`✅ ${data.length} tedarikçi başarıyla eklendi!`);
            setTimeout(() => {
                onImported();
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Import error:', err);
            setError('Hata: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['Business Name', 'Category', 'City', 'Description', 'Instagram URL', 'Website URL'];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "vendor_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content vendor-import-modal">
                <div className="modal-header">
                    <h2>Toplu Tedarikçi Ekle (CSV)</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {!preview.length ? (
                        <div className="upload-section">
                            <p>Lütfen CSV dosyanızı yükleyin.</p>
                            <div className="template-info">
                                <small>Örnek format için şablonu indirin:</small>
                                <button onClick={downloadTemplate} className="btn-text">
                                    📥 Şablonu İndir
                                </button>
                            </div>

                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                        </div>
                    ) : (
                        <div className="preview-section">
                            <p><strong>{preview.length}</strong> kayıt bulundu. Önizleme:</p>
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>İsim</th>
                                            <th>Kategori</th>
                                            <th>Şehir</th>
                                            <th>Instagram</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.slice(0, 5).map((row, i) => (
                                            <tr key={i}>
                                                <td>{row.business_name}</td>
                                                <td>{row.category}</td>
                                                <td>{row.city}</td>
                                                <td>{row.instagram_url}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.length > 5 && <p className="more-text">...ve {preview.length - 5} daha</p>}
                            </div>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={loading}>İptal</button>
                    <button
                        className="btn-primary"
                        onClick={handleImport}
                        disabled={!preview.length || loading || success}
                    >
                        {loading ? 'Yükleniyor...' : 'İçe Aktar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorImportModal;
