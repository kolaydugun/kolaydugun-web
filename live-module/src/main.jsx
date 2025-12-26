import React from 'react'
import ReactDOM from 'react-dom/client'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import App from './App.jsx'
import './index.css'
import './i18n'

const paypalOptions = {
    "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "EUR",
    intent: "capture"
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <PayPalScriptProvider options={paypalOptions}>
            <App />
        </PayPalScriptProvider>
    </React.StrictMode>,
)
