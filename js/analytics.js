const GA_ID = 'G-XXXXXXXXXX';

const ensureDataLayer = () => {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
};

export const trackEvent = (eventName, params = {}) => {
  ensureDataLayer();
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  } else {
    window.dataLayer.push({ event: eventName, ...params });
  }
};

export const initAnalytics = () => {
  ensureDataLayer();
  trackEvent('page_view', {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document.title,
  });
};

export { GA_ID };
