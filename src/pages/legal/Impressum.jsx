import React from 'react';
import useSEO from '../../hooks/useSEO';

const Impressum = () => {
    useSEO({
        title: 'Impressum - KolayDugun.de',
        description: 'Impressum und rechtliche Angaben zu KolayDugun.de'
    });

    return (
        <div className="section container">
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
                <h1 style={{ marginBottom: '30px' }}>Impressum</h1>

                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3>Angaben gemäß § 5 TMG</h3>
                    <p>
                        <strong>Betreiber der Website:</strong><br />
                        [Adınız Soyadınız / Şirket Adınız]<br />
                        [Sokak ve Kapı No]<br />
                        [Posta Kodu ve Şehir]<br />
                        Deutschland
                    </p>

                    <h3 style={{ marginTop: '30px' }}>Kontakt</h3>
                    <p>
                        <strong>Telefon:</strong> [Telefon Numaranız]<br />
                        <strong>E-Mail:</strong> kontakt@kolaydugun.de
                    </p>

                    <h3 style={{ marginTop: '30px' }}>Umsatzsteuer-ID</h3>
                    <p>
                        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                        [Vergi Numaranız (Varsa)]
                    </p>

                    <h3 style={{ marginTop: '30px' }}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
                    <p>
                        [Adınız Soyadınız]<br />
                        [Adresiniz]
                    </p>

                    <h3 style={{ marginTop: '30px' }}>Streitschlichtung</h3>
                    <p>
                        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer"> https://ec.europa.eu/consumers/odr</a>.<br />
                        Unsere E-Mail-Adresse finden Sie oben im Impressum.
                    </p>
                    <p>
                        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Impressum;
