/**
 * Google Analytics 4 tracking utility
 */

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Tracks a page view event
 * @param {string} path - The page path
 * @param {string} title - The page title
 */
export const trackPageView = (path, title) => {
  if (typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      send_to: GA_MEASUREMENT_ID
    });
  }
};

/**
 * Tracks a custom event
 * @param {string} action - The event action
 * @param {object} params - Event parameters
 */
export const trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};

/**
 * Specialized event for book clicks
 * @param {object} book - The book object
 */
export const trackBookClick = (book) => {
  trackEvent('book_click', {
    book_id: book.id,
    book_title: book.title,
    book_category: book.category_name,
    book_author: book.author
  });
};

/**
 * Specialized event for PDF interactions
 * @param {string} type - 'open' or 'download'
 * @param {object} book - The book object
 */
export const trackPDFInteraction = (type, book) => {
  trackEvent('pdf_interaction', {
    interaction_type: type, // 'open' or 'download'
    book_id: book.id,
    book_title: book.title,
    file_type: 'pdf'
  });
};
