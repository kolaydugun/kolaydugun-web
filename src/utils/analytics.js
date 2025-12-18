/**
 * Analytics Helper
 * 
 * Wrapper for Google Analytics 4 event tracking.
 * GA4 is already installed in index.html with ID: G-2ES7LCK9JG
 */

// Check if gtag is available
const isGtagAvailable = () => typeof window !== 'undefined' && typeof window.gtag === 'function';

/**
 * Track a custom event
 */
export const trackEvent = (eventName, params = {}) => {
    if (isGtagAvailable()) {
        window.gtag('event', eventName, params);
        console.log(`📊 Analytics: ${eventName}`, params);
    }
};

/**
 * Track Amazon product click (important for affiliate tracking)
 */
export const trackAmazonClick = (product) => {
    trackEvent('amazon_affiliate_click', {
        product_id: product.id,
        product_name: product.name_de || product.name_tr,
        amazon_asin: product.amazon_asin,
        event_category: 'ecommerce',
        event_label: product.amazon_asin
    });
};

/**
 * Track page view (for SPA navigation)
 */
export const trackPageView = (pagePath, pageTitle) => {
    if (isGtagAvailable()) {
        window.gtag('config', 'G-2ES7LCK9JG', {
            page_path: pagePath,
            page_title: pageTitle
        });
    }
};

/**
 * Track search query
 */
export const trackSearch = (searchTerm, resultsCount) => {
    trackEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount
    });
};

/**
 * Track social share
 */
export const trackShare = (method, contentType, itemId) => {
    trackEvent('share', {
        method: method, // 'whatsapp', 'facebook', 'twitter', 'copy_link'
        content_type: contentType, // 'product', 'blog', etc.
        item_id: itemId
    });
};

/**
 * Track product view
 */
export const trackProductView = (product) => {
    trackEvent('view_item', {
        currency: 'EUR',
        value: product.price || 0,
        items: [{
            item_id: product.id,
            item_name: product.name_de || product.name_tr,
            item_category: product.product_type,
            affiliation: product.product_type === 'amazon' ? 'Amazon' : 'Boutique'
        }]
    });
};

/**
 * Track outbound link click
 */
export const trackOutboundLink = (url, linkType = 'other') => {
    trackEvent('outbound_link', {
        link_url: url,
        link_type: linkType
    });
};

/**
 * Track lead contact attempts (WhatsApp, Phone, Email)
 */
export const trackLeadContact = (method, targetName, targetId) => {
    trackEvent('generate_lead', {
        method: method,
        target_name: targetName,
        target_id: targetId,
        event_category: 'engagement'
    });
};

/**
 * Track funnel steps (e.g., product_view -> add_to_cart -> begin_checkout)
 */
export const trackFunnelStep = (stepName, stepNumber, params = {}) => {
    trackEvent('funnel_step', {
        step_name: stepName,
        step_number: stepNumber,
        ...params
    });
};

/**
 * Track JavaScript errors
 */
export const trackError = (errorMessage, errorSource, fatal = false) => {
    trackEvent('exception', {
        description: errorMessage,
        fatal: fatal,
        error_source: errorSource
    });
};

export default {
    trackEvent,
    trackAmazonClick,
    trackPageView,
    trackSearch,
    trackShare,
    trackProductView,
    trackOutboundLink,
    trackLeadContact,
    trackFunnelStep,
    trackError
};
