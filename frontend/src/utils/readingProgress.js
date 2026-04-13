// Reading Progress Management - Saves to localStorage
const STORAGE_KEY = 'theopensourcelibrary_reading_history';

export const getReadingProgress = (bookSlug) => {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return data[bookSlug] || null;
    } catch {
        return null;
    }
};

export const saveReadingProgress = (bookSlug, page, bookData = {}) => {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        data[bookSlug] = {
            page,
            lastRead: new Date().toISOString(),
            title: bookData.title,
            cover: bookData.cover_image,
            slug: bookSlug,
            category: bookData.category_name
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save reading progress:', e);
    }
};

export const getAllReadingHistory = () => {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        return Object.values(data).sort((a, b) => 
            new Date(b.lastRead) - new Date(a.lastRead)
        );
    } catch {
        return [];
    }
};

export const clearReadingProgress = (bookSlug) => {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        delete data[bookSlug];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
};
