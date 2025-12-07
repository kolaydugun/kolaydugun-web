import React from 'react';
import useSEO from '../../hooks/useSEO';

const Datenschutz = () => {
    useSEO({
        title: 'Datenschutzerklärung - KolayDugun.de',
        description: 'Datenschutzerklärung von KolayDugun.de'
    });

    return (
        <div className="section container">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
                <h1 style={{ marginBottom: '30px' }}>Datenschutzerklärung</h1>

                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3>1. Datenschutz auf einen Blick</h3>
                    <p>
                        <strong>Allgemeine Hinweise</strong><br />
                        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                    </p>

                    <h3 style={{ marginTop: '30px' }}>2. Hosting und Content Delivery Networks (CDN)</h3>
                    <p>
                        Wir hosten die Inhalte unserer Website bei folgenden Anbietern:<br />
                        [Vercel / Netlify / Supabase]
                    </p>

                    <h3 style={{ marginTop: '30px' }}>3. Allgemeine Hinweise und Pflichtinformationen</h3>
                    <p>
                        <strong>Datenschutz</strong><br />
                        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
                    </p>

                    <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
                        (Hinweis: Dies ist ein Platzhalter. Bitte erstellen Sie eine vollständige Datenschutzerklärung mit einem Generator wie e-recht24.de)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Datenschutz;
