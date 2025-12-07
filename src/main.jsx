import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import './i18n'; // Import i18n configuration
import { LanguageProvider } from './context/LanguageContext';
import LoadingSpinner from './components/LoadingSpinner';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'sans-serif' }}>
          <h1>Something went wrong.</h1>
          <p>Please check the console for more details.</p>
          <details style={{ whiteSpace: 'pre-wrap', background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

const paypalOptions = {
  "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
  currency: "EUR",
  intent: "capture",
  vault: true
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <PayPalScriptProvider options={paypalOptions}>
        <HelmetProvider>
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><LoadingSpinner /></div>}>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </Suspense>
        </HelmetProvider>
      </PayPalScriptProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
