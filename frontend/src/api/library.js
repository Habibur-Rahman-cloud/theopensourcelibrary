import axios from 'axios';

/**
 * Cloudflare Pages → Settings → Environment variables (Production):
 *   VITE_API_BASE=https://api.theopensourcelibrary.com/api/
 * Optional if media is on another origin (otherwise derived from API URL):
 *   VITE_MEDIA_BASE=https://api.theopensourcelibrary.com
 */
function normalizeApiBase(raw) {
  const base = (raw || 'http://localhost:8000/api/').trim();
  return base.endsWith('/') ? base : `${base}/`;
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_BASE);

const defaultMediaBase =
  API_BASE.replace(/\/api\/?$/i, '').replace(/\/+$/, '') || 'http://localhost:8000';
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE || defaultMediaBase).trim().replace(/\/+$/, '');
console.log('API Client Version: 2.1.0 (31s timeout)');
const api = axios.create({
  baseURL: API_BASE,
  timeout: 31000, // Unique 31s to distinguish from old 10s or 30s
});

export const getCategories = async () => {
  const response = await api.get('categories/');
  return response.data;
};

export const getBooks = async (params = {}) => {
  const response = await api.get('books/', { params });
  return response.data;
};

export const getBookDetails = async (id) => {
  const response = await api.get(`books/${id}/`);
  return response.data;
};

export const subscribeNewsletter = async (email) => {
  const response = await api.post('newsletter/subscribe/', { email });
  return response.data;
};

export const verifyNewsletter = async (email, otp) => {
  const response = await api.post('newsletter/verify_otp/', { email, otp });
  return response.data;
};

export const checkNewsletterSubscription = async (email) => {
  const response = await api.get('newsletter/check-subscription/', {
    params: { email },
  });
  return response.data;
};

export const submitBookRequest = async ({ title, author_name, email }) => {
  const response = await api.post('request-book/', { title, author_name, email });
  return response.data;
};

export const getMediaUrl = (url, bookSlugOrId = null) => {
  if (!url) return null;

  // Use backend proxy for PDFs if bookSlugOrId is provided to bypass Cloudinary delivery blocks
  if (bookSlugOrId && url.includes('cloudinary.com') && url.includes('/pdfs/')) {
    return `${API_BASE}books/${encodeURIComponent(bookSlugOrId)}/view-pdf/`;
  }

  // If it's already a full URL (like from Cloudinary or an external source)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    let clean = url;
    
    // Fallback/Legacy fix for direct Cloudinary access
    if (clean.includes('cloudinary.com') && clean.includes('/image/upload/') && clean.includes('/pdfs/')) {
      clean = clean.replace('/image/upload/', '/raw/upload/');
      if (!clean.toLowerCase().endsWith('.pdf')) {
        clean = `${clean}.pdf`;
      }
    }
    return clean;
  }
  // Fallback to MEDIA_BASE for locally hosted / stored files
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return MEDIA_BASE + cleanUrl;
};

export default api;
