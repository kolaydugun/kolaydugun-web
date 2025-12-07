import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import './Login.css'; // Reuse login styles

const ForgotPassword = () => {
    const { t } = useLanguage();
    useSEO({
        title: `${t('forgotPassword.title')} - KolayDugun.de`,
        description: t('forgotPassword.description')
    });

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            if (error) throw error;

            setMessage(t('forgotPassword.successMessage'));
        } catch (err) {
            setError(err.message || 'Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section container login-container">
            <div className="login-card">
                <h2 className="text-center mb-lg">{t('forgotPassword.title')}</h2>
                <p className="text-center text-muted mb-lg">
                    {t('forgotPassword.description')}
                </p>

                {message && (
                    <div className="success-message" style={{
                        backgroundColor: '#d1fae5',
                        color: '#065f46',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="login-form-group-last">
                        <label htmlFor="email" className="login-label">{t('forgotPassword.emailLabel')}</label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '...' : t('forgotPassword.submitButton')}
                    </button>
                </form>

                <p className="login-footer">
                    <Link to="/login" className="login-link">← {t('forgotPassword.backToLogin')}</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
