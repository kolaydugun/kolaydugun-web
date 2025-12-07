import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';
import './Login.css';

const UpdatePassword = () => {
    const { t } = useLanguage();
    useSEO({
        title: `${t('updatePassword.title')} - KolayDugun.de`,
        description: t('updatePassword.description')
    });

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have a session (link clicked)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // If no session, maybe the link is invalid or expired
                // But for update password flow, supabase usually sets the session from the hash fragment
            }
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('updatePassword.errorMismatch'));
            return;
        }
        if (password.length < 6) {
            setError(t('updatePassword.errorLength'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Error');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="section container login-container">
                <div className="login-card text-center">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h2>{t('updatePassword.successMessage').split('!')[0]}!</h2>
                    <p className="text-muted mb-lg">
                        {t('updatePassword.successMessage')}
                    </p>
                    <Link to="/login" className="btn btn-primary">{t('forgotPassword.backToLogin')}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="section container login-container">
            <div className="login-card">
                <h2 className="text-center mb-lg">{t('updatePassword.title')}</h2>

                {error && (
                    <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label htmlFor="password" className="login-label">{t('updatePassword.passwordLabel')}</label>
                        <input
                            id="password"
                            type="password"
                            required
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******"
                        />
                    </div>

                    <div className="login-form-group-last">
                        <label htmlFor="confirmPassword" className="login-label">{t('updatePassword.confirmPasswordLabel')}</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            className="login-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="******"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '...' : t('updatePassword.submitButton')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;
