import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const SimpleEditor = ({ value, onChange }) => {
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const savedSelection = useRef(null);

    // Initialize content
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            // Only update if significantly different to avoid cursor jumps
            if (Math.abs(editorRef.current.innerHTML.length - value.length) > 5 || value === '') {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            savedSelection.current = sel.getRangeAt(0);
        }
    };

    const restoreSelection = () => {
        if (savedSelection.current) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedSelection.current);
        }
    };

    const execCmd = (command, value = null) => {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        handleInput(); // Trigger update
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Restore selection before upload starts to ensure we have a place to insert
        restoreSelection();

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            // Restore selection again just in case
            restoreSelection();
            execCmd('insertImage', data.publicUrl);
        } catch (error) {
            alert('Görsel yüklenirken hata oluştu: ' + error.message);
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Inline Input Handlers
    const startLinkInput = (e) => {
        e.preventDefault();
        saveSelection();
        setShowLinkInput(true);
        setShowImageInput(false);
        setUrlInput('');
    };

    const startImageInput = (e) => {
        e.preventDefault();
        saveSelection();
        setShowImageInput(true);
        setShowLinkInput(false);
        setUrlInput('');
    };

    const submitLink = (e) => {
        e.preventDefault();
        if (urlInput) {
            restoreSelection();
            execCmd('createLink', urlInput);
        }
        cancelInput();
    };

    const submitImage = (e) => {
        e.preventDefault();
        if (urlInput) {
            restoreSelection();
            execCmd('insertImage', urlInput);
        }
        cancelInput();
    };

    const cancelInput = () => {
        setShowLinkInput(false);
        setShowImageInput(false);
        setUrlInput('');
        restoreSelection();
    };

    // Prevent focus loss when clicking buttons
    const preventFocusLoss = (e) => {
        e.preventDefault();
        saveSelection();
    };

    const buttonStyle = {
        padding: '6px 10px',
        marginRight: '4px',
        marginBottom: '4px',
        border: '1px solid #ddd',
        background: '#fff',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333'
    };

    return (
        <div className="simple-editor" style={{ border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}>
            {/* Toolbar */}
            <div className="editor-toolbar" style={{ borderBottom: '1px solid #ddd', padding: '10px', background: '#f9f9f9', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                    onChange={(e) => execCmd('fontSize', e.target.value)}
                    style={{ ...buttonStyle, padding: '6px', height: '32px' }}
                    defaultValue="3"
                >
                    <option value="1">Çok Küçük</option>
                    <option value="2">Küçük</option>
                    <option value="3">Normal</option>
                    <option value="4">Orta</option>
                    <option value="5">Büyük</option>
                    <option value="6">Çok Büyük</option>
                    <option value="7">Devasa</option>
                </select>

                <div style={{ width: '1px', background: '#ccc', margin: '0 8px', height: '20px' }}></div>

                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCmd('bold')} style={{ ...buttonStyle, fontWeight: 'bold' }}>B</button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCmd('italic')} style={{ ...buttonStyle, fontStyle: 'italic' }}>I</button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCmd('strikeThrough')} style={{ ...buttonStyle, textDecoration: 'line-through' }}>S</button>

                <div style={{ width: '1px', background: '#ccc', margin: '0 8px', height: '20px' }}></div>

                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCmd('formatBlock', 'H1')} style={buttonStyle}>H1</button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCmd('formatBlock', 'H2')} style={buttonStyle}>H2</button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCmd('formatBlock', 'H3')} style={buttonStyle}>H3</button>

                <div style={{ width: '1px', background: '#ccc', margin: '0 8px', height: '20px' }}></div>

                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCmd('insertUnorderedList')} style={buttonStyle}>• Liste</button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => execCmd('insertOrderedList')} style={buttonStyle}>1. Liste</button>

                <div style={{ width: '1px', background: '#ccc', margin: '0 8px', height: '20px' }}></div>

                <div style={{ width: '1px', background: '#ccc', margin: '0 8px', height: '20px' }}></div>

                {/* Link/Image Buttons or Input Form */}
                {(showLinkInput || showImageInput) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder={showLinkInput ? 'Link URL...' : 'Görsel URL...'}
                            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #3b82f6', outline: 'none' }}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={showLinkInput ? submitLink : submitImage}
                            style={{ ...buttonStyle, background: '#3b82f6', color: 'white', borderColor: '#3b82f6' }}
                        >
                            ✓
                        </button>
                        <button
                            type="button"
                            onClick={cancelInput}
                            style={{ ...buttonStyle, color: '#ef4444' }}
                        >
                            ✕
                        </button>
                    </div>
                ) : (
                    <>
                        <button type="button" onMouseDown={startLinkInput} style={buttonStyle}>🔗 Link</button>
                        <button type="button" onMouseDown={startImageInput} style={buttonStyle}>🖼️ URL Görsel</button>
                    </>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    accept="image/*"
                />
                <button
                    type="button"
                    onMouseDown={(e) => {
                        preventFocusLoss(e);
                        fileInputRef.current?.click();
                    }}
                    style={{ ...buttonStyle, background: uploading ? '#eee' : '#fff' }}
                    disabled={uploading}
                >
                    {uploading ? 'Yükleniyor...' : '📤 Görsel Yükle'}
                </button>
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onBlur={saveSelection} // Save selection when clicking away
                onMouseUp={saveSelection} // Save selection when selecting text
                onKeyUp={saveSelection} // Save selection when typing
                style={{
                    padding: '20px',
                    minHeight: '400px',
                    outline: 'none',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    overflowY: 'auto'
                }}
            />
        </div>
    );
};

export default SimpleEditor;
