import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Info, AlignLeft, Eye, LayoutPanelLeft, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon, FileText, BookOpen, BookmarkCheck } from 'lucide-react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { getMediaUrl } from '../api/library';
import { trackPDFInteraction } from '../utils/analytics';
import { getReadingProgress, saveReadingProgress } from '../utils/readingProgress';

const BookModal = ({ book, onClose }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [showReader, setShowReader] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [page, setPage] = useState(1);
    const [savedProgress, setSavedProgress] = useState(null);

    const pdfUrl = getMediaUrl(book.pdf_file, book.slug);

    // Load saved progress on mount
    useEffect(() => {
        const progress = getReadingProgress(book.slug);
        if (progress) {
            setSavedProgress(progress);
            setPage(progress.page);
        }
    }, [book.slug]);

    // Save progress manually or when closing
    const handleSaveProgress = () => {
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

    const handlersRef = React.useRef({ handleClose: null, handleSave: null });
    handlersRef.current.handleClose = handleCloseReader;
    handlersRef.current.handleSave = handleSaveProgress;

    const ZoomDisplay = () => {
        const [z, setZ] = useState(100);
        useEffect(() => {
            const handleZoom = (e) => setZ(Math.round(e.detail * 100));
            window.addEventListener('pdf-custom-zoom', handleZoom);
            return () => window.removeEventListener('pdf-custom-zoom', handleZoom);
        }, []);
        return <>{z}%</>;
    };

    const defaultLayoutPluginInstance = React.useMemo(() => {
        return defaultLayoutPlugin({
            sidebarTabs: (defaultTabs) => [defaultTabs[0]], // Thumbnails only
            renderToolbar: (Toolbar) => (
                <Toolbar>
                    {(props) => {
                        const { CurrentPageInput, ZoomIn, ZoomOut, ToggleSidebar } = props;
                        return (
                            <div className="w-full p-2 sm:p-3 bg-navy-900 border-b border-white/10 flex items-center justify-between z-[110] gap-2">
                                <button
                                    onClick={() => handlersRef.current.handleClose()}
                                    className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-white rounded-lg font-bold flex items-center space-x-1 sm:space-x-2 shadow-lg hover:scale-105 active:scale-95 transition-all text-sm sm:text-base whitespace-nowrap"
                                >
                                    <X size={16} className="sm:hidden" />
                                    <span className="hidden sm:inline">&larr;</span>
                                    <span className="text-xs sm:text-sm">Close</span>
                                </button>

                                <button
                                    id="save-progress-btn"
                                    onClick={() => handlersRef.current.handleSave()}
                                    className="px-3 py-2 sm:px-4 sm:py-2 bg-white/10 text-white rounded-lg font-bold flex items-center space-x-1 sm:space-x-2 shadow-lg hover:bg-white/20 active:scale-95 transition-all text-xs sm:text-sm whitespace-nowrap border border-white/20"
                                    title="Save current page"
                                >
                                    <BookmarkCheck size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    <span className="hidden sm:inline">Save</span>
                                    <span className="sm:hidden">Save</span>
                                </button>

                                <div className="flex items-center space-x-1 sm:space-x-3">
                                    <div className="flex items-center space-x-1 bg-white/5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/10 custom-pdf-page-input">
                                        <FileText size={14} className="text-primary" />
                                        <span className="text-white/40 text-[10px] uppercase font-black tracking-wider hidden sm:inline">PG</span>
                                        <div className="w-10 sm:w-16">
                                            <CurrentPageInput />
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white/5 rounded-lg sm:rounded-xl border border-white/10 overflow-hidden">
                                        <ZoomOut>
                                            {(zoomOutProps) => (
                                                <button onClick={zoomOutProps.onClick} className="p-1.5 sm:p-2 text-white hover:bg-white/10 transition-colors"><ZoomOutIcon size={16} className="sm:w-[18px] sm:h-[18px]"/></button>
                                            )}
                                        </ZoomOut>
                                        <span className="px-1 sm:px-2 text-white text-[10px] sm:text-xs font-black min-w-[32px] sm:min-w-[40px] text-center flex items-center justify-center">
                                            <ZoomDisplay />
                                        </span>
                                        <ZoomIn>
                                            {(zoomInProps) => (
                                                <button onClick={zoomInProps.onClick} className="p-1.5 sm:p-2 text-white hover:bg-white/10 transition-colors"><ZoomInIcon size={16} className="sm:w-[18px] sm:h-[18px]"/></button>
                                            )}
                                        </ZoomIn>
                                    </div>

                                    <ToggleSidebar>
                                        {(toggleProps) => (
                                            <button 
                                                onClick={toggleProps.onClick}
                                                className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all border ${toggleProps.isToggled ? 'bg-primary text-white border-primary shadow-lg' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                                                title="Toggle Thumbnails"
                                            >
                                                <LayoutPanelLeft size={18} className="sm:w-[20px] sm:h-[20px]" />
                                            </button>
                                        )}
                                    </ToggleSidebar>
                                </div>
                            </div>
                        );
                    }}
                </Toolbar>
            ),
        });
    }, []);

    return (
        <AnimatePresence>
            <style>{`
                .custom-pdf-page-input .rpv-core__textbox {
                    background-color: transparent !important;
                    color: white !important;
                    border: none !important;
                    text-align: center !important;
                    padding: 0 !important;
                    width: 100% !important;
                    font-weight: 900 !important;
                    font-size: 0.875rem !important;
                }
                .custom-pdf-page-input .rpv-core__textbox:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }
                .custom-pdf-wrapper .rpv-default-layout__toolbar {
                    background-color: transparent;
                    border-bottom: none;
                    padding: 0;
                }
                .custom-pdf-wrapper .rpv-core__inner-page {
                    background-color: white !important;
                }
            `}</style>
            <div className={`fixed inset-0 z-[100] flex items-center justify-center ${showReader ? 'p-0' : 'p-4 md:p-8'}`}>
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
                            <div className="w-full md:w-2/5 p-8 md:p-12 modal-cover-bg flex items-center justify-center relative overflow-hidden group">
                                <motion.img 
                                    layoutId={`book-img-${book.id}`}
                                    src={getMediaUrl(book.cover_image)}
                                    alt={book.title}
                                    className="w-full h-auto max-h-[60vh] object-contain rounded-2xl shadow-2xl relative z-10"
                                />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                            </div>

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
                                            <Info size={18} />
                                            <span>Summary</span>
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('description')}
                                            className={`px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 transition-all ${activeTab === 'description' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-heading'}`}
                                        >
                                            <AlignLeft size={18} />
                                            <span>Full Description</span>
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
                                        <button 
                                            onClick={handleResumeReading}
                                            className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg shadow-xl shadow-primary/20 group transform"
                                        >
                                            <BookOpen size={24} className="group-hover:scale-125 transition-transform" />
                                            <div className="flex flex-col items-start">
                                                <span className="font-black uppercase tracking-tight text-sm">RESUME READING</span>
                                                <span className="text-xs text-white/80">Page {savedProgress.page}</span>
                                            </div>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleOpenReader}
                                            className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg shadow-xl shadow-primary/20 group transform"
                                        >
                                            <Eye size={24} className="group-hover:scale-125 transition-transform" />
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
                                        className="btn-outline w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg group transform"
                                    >
                                        <Share2 size={24} className="group-hover:scale-110 transition-transform" />
                                        <span className="font-black">SHARE</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-navy-900 flex flex-col relative custom-pdf-wrapper">
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                <Viewer 
                                    fileUrl={pdfUrl}
                                    plugins={[defaultLayoutPluginInstance]}
                                    initialPage={page ? Math.max(0, page - 1) : 0}
                                    onPageChange={(e) => setPage(e.currentPage + 1)}
                                    // Using a custom event exactly as planned
                                    onZoom={(e) => window.dispatchEvent(new CustomEvent('pdf-custom-zoom', { detail: e.scale }))}
                                    theme="dark" // The pdfjs supports dark theme context potentially, but the viewer handles UI
                                />
                            </Worker>
                            <div className="absolute inset-x-0 bottom-4 pointer-events-none flex justify-center z-[120]">
                                <div className="bg-navy-900/90 backdrop-blur-md px-4 py-2 rounded-full text-white/50 text-[10px] font-bold tracking-widest uppercase border border-white/10 shadow-2xl">
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
