import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Share2, Info, AlignLeft, Eye, LayoutPanelLeft,
    ZoomIn, ZoomOut,
    BookOpen, BookmarkCheck, FileText
} from 'lucide-react';

import { getMediaUrl } from '../api/library';
import { trackPDFInteraction } from '../utils/analytics';
import { getReadingProgress, saveReadingProgress } from '../utils/readingProgress';

function BookModal({ book, onClose }) {
    if (!book) return null;

    const [activeTab, setActiveTab] = useState('summary');
    const [showReader, setShowReader] = useState(false);
    const [savedProgress, setSavedProgress] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(100);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [saveFlash, setSaveFlash] = useState(false);
    const [blobUrl, setBlobUrl] = useState(null);

    const pdfUrl = getMediaUrl(book.pdf_file, book.slug);

    // Load PDF as blob when reader opens
    useEffect(() => {
        if (showReader && pdfUrl && !blobUrl) {
            fetch(pdfUrl)
                .then(res => res.blob())
                .then(blob => {
                    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
                    const url = URL.createObjectURL(pdfBlob);
                    setBlobUrl(url);
                })
                .catch(err => console.error('Error loading PDF:', err));
        }
    }, [showReader, pdfUrl, blobUrl]);

    // Load saved progress
    useEffect(() => {
        const progress = getReadingProgress(book.slug);
        if (progress) {
            setSavedProgress(progress);
            setCurrentPage(progress.page);
        }
    }, [book.slug]);

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

    const getViewerUrl = () => {
        // Use blob URL if available, otherwise fall back to regular URL
        // Prefer direct URL for native viewer features, fallback to blob
        const url = pdfUrl || blobUrl;
        let params = `#toolbar=0&page=${currentPage}&zoom=${zoom}&navpanes=${showThumbnails ? 1 : 0}`;
        if (showThumbnails) params += '&pagemode=thumbs';
        return `${url}${params}`;
    };

    const handleCloseReader = () => {
        handleSaveProgress();
        setShowReader(false);
        // Clean up blob URL to free memory
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
            setBlobUrl(null);
        }
    };

    const handleOpenReader = () => {
        trackPDFInteraction('open', book);
        setShowReader(true);
    };

    const handleResumeReading = () => {
        trackPDFInteraction('resume', book);
        setShowReader(true);
    };

    return (
        <AnimatePresence>

            <div className={`fixed inset-0 z-[100] flex items-center justify-center ${showReader ? 'p-0' : 'p-4 md:p-8'}`}>
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
                    className={`relative w-full max-w-6xl modal-bg overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row h-full ${showReader ? 'md:h-full' : 'md:h-auto md:max-h-[85vh]'} rounded-none md:rounded-[2rem]`}
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
                                                <span className="text-xs text-white/80">Page {savedProgress.page}</span>
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
                            {/* Custom Toolbar */}
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
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-sm active:scale-95 transition-all border ${saveFlash ? 'bg-green-500 border-green-400 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                                        title="Save reading progress"
                                    >
                                        <BookmarkCheck size={15} />
                                        <span className="hidden sm:inline">Save</span>
                                    </button>
                                </div>

                                {/* Center: Page Navigation */}
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5">
                                        <FileText size={14} className="text-primary" />
                                        <span className="text-white/40 text-[10px] uppercase font-black tracking-wider hidden sm:inline">PG</span>
                                        <input
                                            type="number"
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-10 bg-transparent text-white font-black text-center border-none focus:ring-0 text-xs sm:text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Right: Zoom + Thumbnails */}
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                                        <button onClick={() => setZoom(Math.max(50, zoom - 25))} className="p-2 text-white hover:bg-white/10 transition-colors" title="Zoom out">
                                            <ZoomOut size={16} />
                                        </button>
                                        <span className="px-2 text-white text-xs font-black min-w-[44px] text-center">{zoom}%</span>
                                        <button onClick={() => setZoom(Math.min(300, zoom + 25))} className="p-2 text-white hover:bg-white/10 transition-colors" title="Zoom in">
                                            <ZoomIn size={16} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowThumbnails(!showThumbnails)}
                                        className={`p-2 rounded-lg border transition-all active:scale-90 ${showThumbnails ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/10 text-white hover:bg-white/15'}`}
                                        title="Toggle thumbnails"
                                    >
                                        <LayoutPanelLeft size={17} />
                                    </button>
                                </div>
                            </div>

                            {/* PDF Viewer - Iframe */}
                            <div className="flex-1 overflow-hidden bg-gray-200">
                                {blobUrl ? (
                                    <iframe
                                        key={`${zoom}-${showThumbnails}-${currentPage}`}
                                        src={getViewerUrl()}
                                        title={book.title}
                                        className="w-full h-full border-none"
                                        allow="fullscreen"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-[#1a1a2e]">
                                        <div className="flex flex-col items-center space-y-4">
                                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                            <p className="text-white/60 text-sm font-medium">Loading PDF...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Badge */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-40">
                                <div className="bg-[#0d1224]/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white/40 text-[10px] font-bold tracking-widest uppercase border border-white/10">
                                    Secure Content Delivery Active
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}


export default BookModal;
