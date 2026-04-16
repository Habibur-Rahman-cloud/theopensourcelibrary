import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, BookOpen, Eye, Share2, Bookmark, 
    Calendar, Inbox, X, BookmarkCheck, ChevronLeft, ChevronRight,
    ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon
} from 'lucide-react';
import axios from 'axios';
import Loader from '../components/Loader';
import BookCard from '../components/BookCard';
import { getMediaUrl } from '../api/library';
import { trackPDFInteraction } from '../utils/analytics';
import { getReadingProgress, saveReadingProgress } from '../utils/readingProgress';

import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';

const BookDetails = () => {
    const { slug } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReader, setShowReader] = useState(false);
    const [page, setPage] = useState(1);
    const [savedProgress, setSavedProgress] = useState(null);
    const [relatedBooks, setRelatedBooks] = useState([]);

    // Fetch related books when current book is loaded
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

    // Load saved progress when book loads
    useEffect(() => {
        if (book?.slug) {
            const progress = getReadingProgress(book.slug);
            if (progress) {
                setSavedProgress(progress);
                setPage(progress.page);
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

    const handleCloseReader = () => {
        handleSaveProgress();
        setShowReader(false);
    };

    // Sync page input when page changes
    useEffect(() => {
        if (showReader) {
            jumpToPage(page - 1);
        }
    }, [page, showReader, jumpToPage]);

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

    const pdfUrl = getMediaUrl(book.pdf_file, book.slug);
    const [totalPages, setTotalPages] = useState(0);
    const [currentScale, setCurrentScale] = useState(1);

    // --- PDF Viewer Plugins ---
    const pageNavPlugin = useMemo(() => pageNavigationPlugin(), []);
    const zoomPlug = useMemo(() => zoomPlugin(), []);

    const {
        jumpToNextPage,
        jumpToPreviousPage,
        jumpToPage,
        CurrentPageLabel,
        NumberOfPages,
    } = pageNavPlugin;

    const { ZoomIn, ZoomOut, CurrentScale } = zoomPlug;

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
                                    <span className="text-xs text-white/80">Page {savedProgress.page}</span>
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
                <>
                    {/* PDF Viewer Global Styles */}
                    <style>{`
                        .custom-pdf-viewer .rpv-core__inner-container { overflow: hidden !important; }
                        .custom-pdf-viewer .rpv-core__doc-error,
                        .custom-pdf-viewer .rpv-core__doc-loading {
                            color: white;
                            background: transparent;
                        }
                        .custom-page-input {
                            background: transparent;
                            color: white;
                            border: none;
                            outline: none;
                            text-align: center;
                            font-weight: 900;
                            font-size: 0.875rem;
                            width: 40px;
                        }
                        .custom-page-input::-webkit-outer-spin-button,
                        .custom-page-input::-webkit-inner-spin-button { -webkit-appearance: none; }
                    `}</style>

                    <div className="fixed inset-0 z-[100] bg-[#0d1224] flex flex-col custom-pdf-viewer">
                        {/* Custom PDF Toolbar */}
                        <div className="flex items-center justify-between px-3 py-2 bg-[#0d1224] border-b border-white/10 gap-2 flex-shrink-0 z-50">
                            {/* Left: Close + Save */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCloseReader}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/80 active:scale-95 transition-all shadow-lg"
                                >
                                    <X size={15} />
                                    <span className="hidden sm:inline">Close</span>
                                </button>
                                <button
                                    onClick={handleSaveProgress}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg font-bold text-sm hover:bg-white/20 active:scale-95 transition-all"
                                    title="Save reading progress"
                                >
                                    <BookmarkCheck size={15} />
                                    <span className="hidden sm:inline">Save</span>
                                </button>
                            </div>

                            {/* Center: Page Navigation */}
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                    onClick={() => jumpToPreviousPage()}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/15 active:scale-90 transition-all"
                                    title="Previous page"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5">
                                    <input
                                        className="custom-page-input"
                                        type="number"
                                        value={page}
                                        onChange={(e) => setPage(Math.max(1, parseInt(e.target.value) || 1))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const pg = Math.max(1, Math.min(totalPages, parseInt(page) || 1));
                                                jumpToPage(pg - 1);
                                                setPage(pg);
                                            }
                                        }}
                                        onBlur={() => {
                                            const pg = Math.max(1, Math.min(totalPages, parseInt(page) || 1));
                                            jumpToPage(pg - 1);
                                            setPage(pg);
                                        }}
                                        min={1}
                                        max={totalPages}
                                    />
                                    <span className="text-white/40 text-xs font-bold">/</span>
                                    <span className="text-white/60 text-xs font-black min-w-[24px]">
                                        <NumberOfPages>
                                            {({ numberOfPages }) => <span>{numberOfPages}</span>}
                                        </NumberOfPages>
                                    </span>
                                </div>

                                <button
                                    onClick={() => jumpToNextPage()}
                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/15 active:scale-90 transition-all"
                                    title="Next page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Right: Zoom */}
                            <div className="flex items-center gap-1 sm:gap-2">
                                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                                    <ZoomOut>
                                        {({ onClick }) => (
                                            <button onClick={onClick} className="p-2 text-white hover:bg-white/15 transition-colors active:scale-90" title="Zoom out">
                                                <ZoomOutIcon size={16} />
                                            </button>
                                        )}
                                    </ZoomOut>
                                    <CurrentScale>
                                        {({ scale }) => (
                                            <span className="px-2 text-white text-xs font-black min-w-[44px] text-center">
                                                {Math.round(scale * 100)}%
                                            </span>
                                        )}
                                    </CurrentScale>
                                    <ZoomIn>
                                        {({ onClick }) => (
                                            <button onClick={onClick} className="p-2 text-white hover:bg-white/15 transition-colors active:scale-90" title="Zoom in">
                                                <ZoomInIcon size={16} />
                                            </button>
                                        )}
                                    </ZoomIn>
                                </div>
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 overflow-hidden">
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                <Viewer
                                    fileUrl={pdfUrl}
                                    plugins={[pageNavPlugin, zoomPlug]}
                                    defaultScale={SpecialZoomLevel.PageWidth}
                                    initialPage={page > 1 ? page - 1 : 0}
                                    onPageChange={(e) => {
                                        setPage(e.currentPage + 1);
                                    }}
                                    onDocumentLoad={(e) => {
                                        setTotalPages(e.doc.numPages);
                                    }}
                                    theme={{ theme: 'dark' }}
                                />
                            </Worker>
                        </div>

                        {/* Bottom Badge */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-40">
                            <div className="bg-[#0d1224]/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white/40 text-[10px] font-bold tracking-widest uppercase border border-white/10">
                                Secure Content Delivery Active
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BookDetails;
