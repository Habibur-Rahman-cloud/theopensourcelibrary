import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Share2, Info, AlignLeft, Eye,
    BookOpen, BookmarkCheck, ArrowLeft
} from 'lucide-react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

import { getMediaUrl } from '../api/library';
import { trackPDFInteraction } from '../utils/analytics';
import { getReadingProgress, saveReadingProgress } from '../utils/readingProgress';

function BookModal({ book, onClose }) {
    if (!book) return null;

    const [activeTab, setActiveTab] = useState('summary');
    const [showReader, setShowReader] = useState(false);
    const [savedProgress, setSavedProgress] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [saveFlash, setSaveFlash] = useState(false);
    const [blobUrl, setBlobUrl] = useState(null);

    // Ref to always hold the latest target page — avoids stale closure in onDocumentLoad
    const targetPageRef = useRef(0);

    // Stable plugin instance — recreating it every render breaks jumpToPage
    const pageNavigationPluginInstance = useMemo(() => pageNavigationPlugin(), []);
    const { jumpToPage } = pageNavigationPluginInstance;

    const pdfUrl = getMediaUrl(book.pdf_file, book.slug);

    // Load saved progress and sync ref
    useEffect(() => {
        const progress = getReadingProgress(book.slug);
        if (progress) {
            setSavedProgress(progress);
            setCurrentPage(progress.page);
            targetPageRef.current = progress.page; // always keep ref in sync
        }
    }, [book.slug]);

    // Clean up blob URL to free memory
    const clearBlobUrl = () => {
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
            setBlobUrl(null);
        }
    };

    // Fetch PDF as blob when reader opens
    useEffect(() => {
        let active = true;
        let currentBlobUrl = null;

        const fetchPdfAsBlob = async () => {
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

        fetchPdfAsBlob();

        return () => {
            active = false;
            if (currentBlobUrl) {
                URL.revokeObjectURL(currentBlobUrl);
            }
        };
    }, [showReader, pdfUrl, book]);

    const handleSaveProgress = () => {
        saveReadingProgress(book.slug, currentPage, {
            title: book.title,
            cover_image: book.cover_image,
            category_name: book.category_name,
        });
        setSavedProgress(getReadingProgress(book.slug));
        setSaveFlash(true);
        setTimeout(() => setSaveFlash(false), 800);
    };

    const handlePageChange = (e) => {
        const pg = e.currentPage;
        setCurrentPage(pg);
        targetPageRef.current = pg;
        // Auto-save on every page turn
        saveReadingProgress(book.slug, pg, {
            title: book.title,
            cover_image: book.cover_image,
            category_name: book.category_name,
        });
    };

    const handleDocumentLoad = () => {
        // Use ref — guaranteed to have the latest value, no stale closure issue
        const target = targetPageRef.current;
        if (target > 0) {
            // Small delay lets the viewer finish rendering before we scroll
            setTimeout(() => jumpToPage(target), 300);
        }
    };

    const handleCloseReader = () => {
        setIsReaderLoaded(false);
        setShowReader(false);
        clearBlobUrl();
    };

    const handleOpenReader = () => {
        setShowReader(true);
    };

    const handleResumeReading = () => {
        setShowReader(true);
    };

    return (
        <AnimatePresence>

            <div className={`fixed inset-0 z-[100] flex items-center justify-center ${showReader ? 'p-0 md:p-8' : 'p-4 md:p-8'}`}>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    className={`relative w-full modal-bg overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row h-full ${showReader ? 'md:max-w-5xl md:h-[90vh] md:rounded-[2rem]' : 'max-w-6xl md:h-auto md:max-h-[85vh] md:rounded-[2rem]'} rounded-none`}
                >
                    {/* ══════════════════════════════════════
                        BOOK DETAIL VIEW
                    ══════════════════════════════════════ */}
                    {!showReader && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 md:top-6 md:right-6 z-[110] p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all transform active:scale-90 shadow-xl backdrop-blur-md"
                        >
                            <X size={24} />
                        </button>
                    )}

                    {!showReader ? (
                        <>
                            {/* Cover */}
                            <div className="w-full md:w-2/5 p-8 md:p-12 modal-cover-bg flex items-center justify-center relative overflow-hidden group">
                                <motion.img
                                    layoutId={`book-img-${book.id}`}
                                    src={getMediaUrl(book.cover_image)}
                                    alt={book.title}
                                    className="w-full h-auto max-h-[60vh] object-contain rounded-2xl shadow-2xl relative z-10"
                                />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                            </div>

                            {/* Info */}
                            <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                                <div className="mb-8">
                                    <span className="text-primary font-black uppercase tracking-widest text-xs mb-3 block px-4 py-1.5 bg-primary/5 rounded-full w-fit border border-primary/20">
                                        {book.category_name}
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-black text-heading mb-6 leading-tight tracking-tight">{book.title}</h2>

                                    <div className="flex space-x-2 p-1.5 rounded-2xl w-fit border border-white/5 shadow-inner bg-navy-900">
                                        <button
                                            onClick={() => setActiveTab('summary')}
                                            className={`px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${activeTab === 'summary' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-heading'}`}
                                        >
                                            <Info size={18} /><span>Summary</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('description')}
                                            className={`px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${activeTab === 'description' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-heading'}`}
                                        >
                                            <AlignLeft size={18} /><span>Full Description</span>
                                        </button>
                                    </div>
                                </div>

                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex-grow mb-12"
                                >
                                    <p className="text-lg md:text-xl text-muted leading-relaxed font-medium">
                                        {activeTab === 'summary' ? book.summary : book.description}
                                    </p>
                                </motion.div>

                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-auto">
                                    {savedProgress ? (
                                        <button onClick={handleResumeReading} className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg shadow-xl shadow-primary/20 group transform">
                                            <BookOpen size={24} className="group-hover:scale-125 transition-transform" />
                                            <div className="flex flex-col items-start">
                                                <span className="font-black uppercase tracking-tight text-sm">RESUME READING</span>
                                                <span className="text-xs text-white/80">Page {savedProgress.page + 1}</span>
                                            </div>
                                        </button>
                                    ) : (
                                        <button onClick={handleOpenReader} className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg shadow-xl shadow-primary/20 group transform">
                                            <Eye size={24} className="group-hover:scale-125 transition-transform" />
                                            <span className="font-black uppercase tracking-tight">READ ONLINE</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            const shareData = {
                                                title: book.title,
                                                text: `Check out "${book.title}" on The Opensource Library - ${book.summary?.substring(0, 100)}...`,
                                                url: `${window.location.origin}/book/${book.slug}`,
                                            };
                                            if (navigator.share) {
                                                navigator.share(shareData);
                                            } else {
                                                navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                                                alert('Link copied to clipboard!');
                                            }
                                        }}
                                        className="btn-outline w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg group transform"
                                    >
                                        <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-black">SHARE</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ══════════════════════════════════════
                           IFRAME PDF READER VIEW
                        ══════════════════════════════════════ */
                        <div className="w-full h-full flex flex-col bg-[#0d1224]">
                            {/* Floating Close Button for Reader */}
                            <button
                                onClick={handleCloseReader}
                                className="absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transform active:scale-90 shadow-2xl backdrop-blur-md border border-white/10 group"
                                title="Exit Reader"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            {/* PDF Viewer */}
                            <div className="flex-1 overflow-hidden bg-[#0d1224] relative">
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
                                            <p className="text-white/60 text-sm font-medium">Loading PDF Reader...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}


export default BookModal;
