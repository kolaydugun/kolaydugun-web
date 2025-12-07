import React from 'react';
import useSEO from '../../hooks/useSEO';

const Widerrufsrecht = () => {
    useSEO({
        title: 'Widerrufsrecht - KolayDugun.de',
        description: 'Widerrufsbelehrung für Verbraucher'
    });

    return (
        <div className="section container">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
                <h1 style={{ marginBottom: '30px' }}>Widerrufsbelehrung</h1>

                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3>Widerrufsrecht</h3>
                    <p>
                        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
                        Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
                    </p>

                    <h3 style={{ marginTop: '30px' }}>Folgen des Widerrufs</h3>
                    <p>
                        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
                    </p>

                    <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
                        (Hinweis: Dies ist ein Platzhalter für digitale Dienstleistungen.)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Widerrufsrecht;
