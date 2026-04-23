import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, BookOpen, Eye, Share2, Bookmark, 
    Calendar, Inbox, X, BookmarkCheck
} from 'lucide-react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import axios from 'axios';
import Loader from '../components/Loader';
import BookCard from '../components/BookCard';
import { getMediaUrl } from '../api/library';
import { trackPDFInteraction } from '../utils/analytics';
import { getReadingProgress, saveReadingProgress } from '../utils/readingProgress';

const BookDetails = () => {
    const { slug } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReader, setShowReader] = useState(false);
    const [page, setPage] = useState(0); // 0-indexed
    const [savedProgress, setSavedProgress] = useState(null);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [blobUrl, setBlobUrl] = useState(null);

    // Ref always holds the latest target page — no stale closure in onDocumentLoad
    const targetPageRef = useRef(0);

    // Stable plugin instance — useMemo prevents recreation on every render
    const pageNavigationPluginInstance = useMemo(() => pageNavigationPlugin(), []);
    const { jumpToPage } = pageNavigationPluginInstance;

    const pdfUrl = book ? getMediaUrl(book.pdf_file, book.slug) : null;

    useEffect(() => {
        const fetchRelated = async () => {
            if (book?.category_slug) {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_BASE}books/?category=${book.category_slug}`);
                    const filtered = response.data.filter(b => b.slug !== book.slug).slice(0, 4);
                    setRelatedBooks(filtered);
                } catch (error) {
                    console.error("Error fetching related books:", error);
                }
            }
        };
        fetchRelated();
    }, [book]);

    // Load saved progress when book loads and sync ref
    useEffect(() => {
        if (book?.slug) {
            const progress = getReadingProgress(book.slug);
            if (progress) {
                setSavedProgress(progress);
                setPage(progress.page);
                targetPageRef.current = progress.page; // keep ref in sync
            }
        }
    }, [book]);

    // Save progress manually or when closing
    const handleSaveProgress = () => {
        if (book) {
            saveReadingProgress(book.slug, page, {
                title: book.title,
                cover_image: book.cover_image,
                category_name: book.category_name
            });
            setSavedProgress(getReadingProgress(book.slug));
            // Show brief visual feedback
            const btn = document.getElementById('save-progress-btn');
            if (btn) {
                btn.classList.add('bg-green-500');
                setTimeout(() => btn.classList.remove('bg-green-500'), 500);
            }
        }
    };

    // Clean up blob URL to free memory
    const clearBlobUrl = () => {
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
            setBlobUrl(null);
        }
    };

    const handleCloseReader = () => {
        setShowReader(false);
        clearBlobUrl();
    };

    // Fetch PDF as blob when reader opens
    useEffect(() => {
        let active = true;
        let currentBlobUrl = null;

        const loadPdfAsBlob = async () => {
            if (showReader && pdfUrl && !blobUrl) {
                try {
                    const response = await fetch(pdfUrl);
                    if (!response.ok) throw new Error('Failed to fetch PDF');
                    const blob = await response.blob();
                    if (!active) return;

                    const url = URL.createObjectURL(blob);
                    currentBlobUrl = url;
                    setBlobUrl(url);
                    trackPDFInteraction(savedProgress ? 'resume' : 'open', book);
                } catch (error) {
                    console.error("Error loading PDF blob:", error);
                }
            }
        };

        loadPdfAsBlob();

        return () => {
            active = false;
            // We clear it on unmount or if deps change
            if (currentBlobUrl) {
                URL.revokeObjectURL(currentBlobUrl);
            }
        };
    }, [showReader, pdfUrl, book]);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE}books/${slug}/`);
                setBook(response.data);
                
                // Update SEO Meta Tags
                document.title = `${response.data.title} | The Opensource Library`;
                updateMetaTag('description', response.data.summary);
                updateMetaTag('og:title', response.data.title);
                updateMetaTag('og:description', response.data.summary);
                updateMetaTag('og:image', getMediaUrl(response.data.cover_image));
                
            } catch (error) {
                console.error("Error fetching book details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [slug]);

    const updateMetaTag = (name, content) => {
        let tag = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (!tag) {
            tag = document.createElement('meta');
            if (name.startsWith('og:')) tag.setAttribute('property', name);
            else tag.setAttribute('name', name);
            document.head.appendChild(tag);
        }
        tag.setAttribute('content', content);
    };

    if (loading) return <Loader />;
    if (!book) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <h1 className="text-4xl font-black text-heading">Book not found</h1>
            <Link to="/" className="btn-primary flex items-center space-x-2">
                <ArrowLeft size={18} />
                <span>Go Home</span>
            </Link>
        </div>
    );


    const handlePageChange = (e) => {
        const pg = e.currentPage;
        setPage(pg);
        targetPageRef.current = pg;
        saveReadingProgress(book.slug, pg, {
            title: book.title,
            cover_image: book.cover_image,
            category_name: book.category_name
        });
        setSavedProgress(getReadingProgress(book.slug));
    };

    const handleDocumentLoad = () => {
        // Use ref — always has the latest value, no stale closure issue
        const target = targetPageRef.current;
        if (target > 0) {
            setTimeout(() => jumpToPage(target), 300);
        }
    };

    // JSON-LD Structured Data for Google
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Book",
        "name": book.title,
        "description": book.summary,
        "image": getMediaUrl(book.cover_image),
        "genre": book.category_name,
        "datePublished": book.created_at,
        "offers": {
            "@type": "Offer",
            "availability": "https://schema.org/InStock",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <script type="application/ld+json">
                {JSON.stringify(jsonLd)}
            </script>

            <Link to="/" className="inline-flex items-center space-x-2 text-muted hover:text-primary transition-colors mb-8 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold uppercase tracking-widest text-sm">Back to Library</span>
            </Link>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* Left: Book Cover */}
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-2/5"
                >
                    <div className="relative group">
                        <img 
                            src={getMediaUrl(book.cover_image)}
                            alt={book.title}
                            className="w-full h-auto rounded-3xl shadow-2xl shadow-black/40 border border-white/5"
                        />
                        <div className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full -z-10 opacity-50"></div>
                    </div>
                </motion.div>

                {/* Right: Details */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full lg:w-3/5 flex flex-col"
                >
                    <div className="mb-6 flex flex-wrap gap-3">
                        <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest rounded-full">
                            {book.category_name}
                        </span>
                        <div className="flex items-center space-x-2 text-muted text-xs font-bold uppercase tracking-widest px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                            <Calendar size={14} />
                            <span>{new Date(book.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-heading mb-8 leading-tight">
                        {book.title}
                    </h1>

                    <div className="space-y-8 mb-12">
                        <div>
                            <h3 className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center space-x-2">
                                <Inbox size={14} />
                                <span>Quick Summary</span>
                            </h3>
                            <p className="text-lg md:text-xl text-muted font-medium leading-relaxed">
                                {book.summary}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center space-x-2">
                                <Bookmark size={14} />
                                <span>Description</span>
                            </h3>
                            <p className="text-muted leading-relaxed whitespace-pre-line">
                                {book.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 mt-auto pt-8 border-t border-white/5">
                        {savedProgress ? (
                            <button
                                onClick={() => {
                                    trackPDFInteraction('resume', book);
                                    setShowReader(true);
                                }}
                                className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg shadow-xl shadow-primary/20 group hover:scale-[1.02] transition-transform"
                            >
                                <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
                                <div className="flex flex-col items-start">
                                    <span className="font-black uppercase tracking-tight text-sm">RESUME READING</span>
                                    <span className="text-xs text-white/80">Page {savedProgress.page + 1}</span>
                                </div>
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    trackPDFInteraction('open', book);
                                    setShowReader(true);
                                }}
                                className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg shadow-xl shadow-primary/20 group hover:scale-[1.02] transition-transform"
                            >
                                <Eye size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="font-black uppercase tracking-tight">READ ONLINE</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                const shareData = {
                                    title: book.title,
                                    text: `Check out "${book.title}" on The Opensource Library - ${book.summary?.substring(0, 100)}...`,
                                    url: `${window.location.origin}/book/${book.slug}`
                                };
                                if (navigator.share) {
                                    navigator.share(shareData);
                                } else {
                                    navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            className="btn-outline w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg group hover:scale-[1.02] transition-transform"
                        >
                            <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="font-black uppercase tracking-tight">SHARE</span>
                        </button>
                    </div>

                    {relatedBooks.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-white/5">
                            <h3 className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center space-x-2">
                                <Bookmark size={14} />
                                <span>Related Books</span>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6">
                                {relatedBooks.map((relatedBook, idx) => (
                                    <BookCard 
                                        key={relatedBook.id} 
                                        book={relatedBook} 
                                        index={idx} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {showReader && (
                <div className="fixed inset-0 md:inset-8 z-[100] bg-[#0d1224] flex flex-col md:rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                    {/* Compact Responsive Header */}
                    {/* Floating Close Button */}
                    <button
                        onClick={handleCloseReader}
                        className="absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transform active:scale-90 shadow-2xl backdrop-blur-md border border-white/10 group"
                        title="Exit Reader"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="flex-grow w-full bg-[#0d1224] overflow-hidden relative">
                        {blobUrl ? (
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                <Viewer
                                    fileUrl={blobUrl}
                                    defaultScale={SpecialZoomLevel.PageWidth}
                                    onDocumentLoad={handleDocumentLoad}
                                    onPageChange={handlePageChange}
                                    plugins={[pageNavigationPluginInstance]}
                                    theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                                />
                            </Worker>
                        ) : (
                            <div className="flex items-center justify-center h-full bg-[#1a1a2e]">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-white/60 text-sm font-medium">Loading Reader...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDetails;
