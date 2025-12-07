import React from 'react';
import useSEO from '../../hooks/useSEO';

const AGB = () => {
    useSEO({
        title: 'AGB - KolayDugun.de',
        description: 'Allgemeine Geschäftsbedingungen von KolayDugun.de'
    });

    return (
        <div className="section container">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
                <h1 style={{ marginBottom: '30px' }}>Allgemeine Geschäftsbedingungen (AGB)</h1>

                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3>1. Geltungsbereich</h3>
                    <p>
                        Für die Geschäftsbeziehung zwischen KolayDugun.de (nachfolgend „Anbieter“) und dem Kunden (nachfolgend „Kunde“) gelten ausschließlich die nachfolgenden Allgemeinen Geschäftsbedingungen in ihrer zum Zeitpunkt der Bestellung gültigen Fassung.
                    </p>

                    <h3 style={{ marginTop: '30px' }}>2. Vertragsgegenstand</h3>
                    <p>
                        Gegenstand des Vertrages ist die Nutzung der Plattform zur Vermittlung von Hochzeitsdienstleistungen.
                    </p>

                    <h3 style={{ marginTop: '30px' }}>3. Vertragsschluss</h3>
                    <p>
                        Die Präsentation der Dienstleistungen auf der Website stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung dar.
                    </p>

                    <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
                        (Hinweis: Dies ist ein Platzhalter. Bitte erstellen Sie vollständige AGB mit einem Anwalt oder Generator.)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AGB;
