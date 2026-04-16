import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Share2, Info, AlignLeft, Eye, LayoutPanelLeft,
    ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon,
    BookOpen, BookmarkCheck, ChevronLeft, ChevronRight,
    Maximize2, Minimize2
} from 'lucide-react';

import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';

import { getMediaUrl } from '../api/library';
import { trackPDFInteraction } from '../utils/analytics';
import { getReadingProgress, saveReadingProgress } from '../utils/readingProgress';

const BookModal = ({ book, onClose }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [showReader, setShowReader] = useState(false);
    const [savedProgress, setSavedProgress] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [currentScale, setCurrentScale] = useState(1);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [saveFlash, setSaveFlash] = useState(false);
    const [pageInput, setPageInput] = useState('1');

    const pdfUrl = getMediaUrl(book.pdf_file, book.slug);

    // --- Plugins (created once per mount) ---
    const pageNavPlugin = useMemo(() => pageNavigationPlugin(), []);
    const zoomPlug     = useMemo(() => zoomPlugin(),           []);
    const thumbPlug    = useMemo(() => thumbnailPlugin(),      []);

    const {
        jumpToNextPage,
        jumpToPreviousPage,
        jumpToPage,
        CurrentPageLabel,
        NumberOfPages,
    } = pageNavPlugin;

    const { ZoomIn, ZoomOut, CurrentScale } = zoomPlug;
    const { Thumbnails } = thumbPlug;

    // Load saved progress
    useEffect(() => {
        const progress = getReadingProgress(book.slug);
        if (progress) {
            setSavedProgress(progress);
            setCurrentPage(progress.page);
            setPageInput(String(progress.page));
        }
    }, [book.slug]);

    // Sync page input when currentPage changes externally
    useEffect(() => {
        setPageInput(String(currentPage));
    }, [currentPage]);

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

    const handleCloseReader = () => {
        handleSaveProgress();
        setShowReader(false);
    };

    const handleOpenReader = () => {
        trackPDFInteraction('open', book);
        setShowReader(true);
    };

    const handleResumeReading = () => {
        trackPDFInteraction('resume', book);
        setShowReader(true);
    };

    // Jump to page on input enter
    const handlePageInputSubmit = (e) => {
        if (e.key === 'Enter') {
            const pg = Math.max(1, Math.min(totalPages, parseInt(pageInput) || 1));
            jumpToPage(pg - 1);
            setPageInput(String(pg));
        }
    };

    return (
        <AnimatePresence>
            {/* ── Global PDF viewer override styles ── */}
            <style>{`
                .rpv-core__inner-container { overflow: hidden !important; }
                .custom-pdf-viewer .rpv-core__doc-error,
                .custom-pdf-viewer .rpv-core__doc-loading {
                    color: white;
                    background: transparent;
                }
                .custom-pdf-viewer .rpv-thumbnail__items {
                    padding: 8px 4px;
                    background: #0d1224;
                }
                .custom-pdf-viewer .rpv-thumbnail__item {
                    border: 2px solid transparent;
                    border-radius: 6px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .custom-pdf-viewer .rpv-thumbnail__item--selected,
                .custom-pdf-viewer .rpv-thumbnail__item:hover {
                    border-color: #7c3aed;
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
                           CUSTOM PDF READER VIEW
                        ══════════════════════════════════════ */
                        <div className="w-full h-full flex flex-col bg-[#0d1224] custom-pdf-viewer">

                            {/* ── Custom Toolbar ── */}
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
                                            value={pageInput}
                                            onChange={(e) => setPageInput(e.target.value)}
                                            onKeyDown={handlePageInputSubmit}
                                            onBlur={() => {
                                                const pg = Math.max(1, Math.min(totalPages, parseInt(pageInput) || 1));
                                                jumpToPage(pg - 1);
                                                setPageInput(String(pg));
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

                                {/* Right: Zoom + Thumbnails */}
                                <div className="flex items-center gap-1 sm:gap-2">
                                    {/* Zoom */}
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

                                    {/* Thumbnails toggle */}
                                    <button
                                        onClick={() => setShowThumbnails(!showThumbnails)}
                                        className={`p-2 rounded-lg border transition-all active:scale-90 ${showThumbnails ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 border-white/10 text-white hover:bg-white/15'}`}
                                        title="Toggle thumbnails"
                                    >
                                        <LayoutPanelLeft size={17} />
                                    </button>
                                </div>
                            </div>

                            {/* ── Reader Body ── */}
                            <div className="flex flex-1 overflow-hidden">

                                {/* Thumbnail Sidebar */}
                                {showThumbnails && (
                                    <div className="w-[140px] sm:w-[160px] flex-shrink-0 overflow-y-auto bg-[#0d1224] border-r border-white/10 custom-scrollbar">
                                        <Thumbnails />
                                    </div>
                                )}

                                {/* PDF Viewer */}
                                <div className="flex-1 overflow-hidden">
                                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                        <Viewer
                                            fileUrl={pdfUrl}
                                            plugins={[pageNavPlugin, zoomPlug, thumbPlug]}
                                            defaultScale={SpecialZoomLevel.PageWidth}
                                            initialPage={currentPage > 1 ? currentPage - 1 : 0}
                                            onPageChange={(e) => {
                                                setCurrentPage(e.currentPage + 1);
                                            }}
                                            onDocumentLoad={(e) => {
                                                setTotalPages(e.doc.numPages);
                                            }}
                                            theme={{ theme: 'dark' }}
                                        />
                                    </Worker>
                                </div>
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
};

export default BookModal;
