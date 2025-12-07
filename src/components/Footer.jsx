import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-brand">
                    <div className="footer-logo">KolayDugun.de</div>
                    <p className="footer-copyright">&copy; {new Date().getFullYear()} KolayDugun.de. {t('footer.rights')}</p>
                </div>
                <div className="footer-links">
                    <Link to="/faq" className="footer-link">{t('faq.title')}</Link>
                    <Link to="/p/impressum" className="footer-link">{t('footer.impressum')}</Link>
                    <Link to="/p/datenschutz" className="footer-link">{t('footer.privacy')}</Link>
                    <Link to="/p/agb" className="footer-link">{t('footer.terms')}</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
