import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Info, AlignLeft, Eye, BookmarkCheck, ChevronLeft } from 'lucide-react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { getMediaUrl } from '../api/library';

const BookModal = ({ book, onClose }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [showReader, setShowReader] = useState(false);
    const [lastReadPage, setLastReadPage] = useState(() => {
        try {
            const savedPage = localStorage.getItem(`bookmark-book-${book.id}`);
            return savedPage ? parseInt(savedPage, 10) : 0;
        } catch {
            return 0;
        }
    });

    // Optimized: Custom toolbar layout as requested by the user
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar: (Toolbar) => (
            <Toolbar>
                {(slots) => {
                    const {
                        CurrentPageInput,
                        GoToNextPage,
                        GoToPreviousPage,
                        NumberOfPages,
                        ZoomIn,
                        ZoomOut,
                        EnterFullScreen,
                        SwitchSidebar,
                    } = slots;
                    return (
                        <div className="flex items-center justify-between w-full px-2 md:px-6 py-2 bg-navy-900 border-b border-white/5">
                            {/* Left Side - Minimal/None as requested */}
                            <div className="w-24 md:w-32"></div>

                            {/* Center - Page Navigation */}
                            <div className="flex items-center space-x-1 md:space-x-3 bg-white/5 py-1 px-2 md:px-4 rounded-xl border border-white/10">
                                <GoToPreviousPage />
                                <div className="flex items-center space-x-1 text-white font-black text-xs md:text-sm min-w-fit">
                                    <div className="w-10">
                                        <CurrentPageInput />
                                    </div>
                                    <span className="opacity-40">/</span>
                                    <NumberOfPages />
                                </div>
                                <GoToNextPage />
                            </div>

                            {/* Right Side - Tools (Zoom, Thumbnail, Fullscreen) */}
                            <div className="flex items-center space-x-0.5 md:space-x-2">
                                <div className="hidden sm:flex items-center space-x-1 mr-2 px-2 border-r border-white/10">
                                    <ZoomOut />
                                    <ZoomIn />
                                </div>
                                <SwitchSidebar />
                                <EnterFullScreen />
                            </div>
                        </div>
                    );
                }}
            </Toolbar>
        ),
        sidebarTabs: (defaultTabs) => 
            defaultTabs.filter((tab) => tab.contentKey === 'thumbnails'),
    });

    const handlePageChange = (e) => {
        if (book && showReader) {
            const page = e.currentPage;
            setLastReadPage(page);
            localStorage.setItem(`bookmark-book-${book.id}`, page.toString());
        }
    };

    const pdfUrl = getMediaUrl(book.pdf_file);

    return (
        <AnimatePresence>
            <div className={`fixed inset-0 z-[100] flex items-center justify-center ${showReader ? 'p-0 md:p-8' : 'p-4 md:p-8'}`}>
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
                    className={`relative w-full max-w-6xl modal-bg overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row h-full md:h-auto md:max-h-[90vh] rounded-none md:rounded-[2rem]`}
                >
                    {!showReader && (
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 md:top-6 md:right-6 z-[110] p-3 bg-black/40 hover:bg-black/60 md:bg-white/5 md:hover:bg-white/10 rounded-full text-white md:text-heading transition-all transform active:scale-90 shadow-xl backdrop-blur-md"
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
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                            </div>

                            <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col">
                                <div className="mb-8">
                                    <span className="text-primary font-black uppercase tracking-widest text-xs mb-3 block px-4 py-1.5 bg-primary/5 rounded-full w-fit border border-primary/20">
                                         {book.category_name}
                                    </span>
                                    <h2 className="text-3xl md:text-5xl font-black text-heading mb-6 leading-tight tracking-tight">{book.title}</h2>
                                    
                                    <div className="flex space-x-2 p-1.5 rounded-2xl w-fit border border-white/5 shadow-inner" style={{ background: 'var(--bg-primary)' }}>
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
                                    <button 
                                        onClick={() => setShowReader(true)}
                                        className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg shadow-xl shadow-primary/20 group transform"
                                    >
                                        {lastReadPage > 0 ? (
                                            <>
                                                <BookmarkCheck size={24} className="group-hover:scale-125 transition-transform text-accent" />
                                                <span className="font-black uppercase tracking-tight">RESUME READING <span className="opacity-50 text-sm ml-1">(Pg {lastReadPage + 1})</span></span>
                                            </>
                                        ) : (
                                            <>
                                                <Eye size={24} className="group-hover:scale-125 transition-transform" />
                                                <span className="font-black uppercase tracking-tight">READ ONLINE</span>
                                            </>
                                        )}
                                    </button>
                                    <a 
                                        href={pdfUrl} 
                                        download 
                                        className="btn-outline w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg group transform"
                                    >
                                        <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
                                        <span className="font-black">DOWNLOAD</span>
                                    </a>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full md:h-[90vh] bg-white flex flex-col relative">
                            {/* Improved Mobile Navigation Overlay */}
                            <div className="absolute top-2 left-2 z-50 md:top-4 md:left-4 flex items-center space-x-2 md:space-x-4">
                                <button 
                                    onClick={() => setShowReader(false)}
                                    className="p-3 md:px-6 md:py-3 bg-navy-900 text-white rounded-xl md:rounded-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center md:space-x-2 ring-4 ring-primary/20"
                                >
                                    <ChevronLeft size={24} />
                                    <span className="hidden md:inline">BACK TO INFO</span>
                                </button>
                                {lastReadPage > 0 && (
                                    <div className="hidden sm:flex bg-primary/90 backdrop-blur-md px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-white font-bold text-[10px] md:text-sm shadow-xl items-center space-x-1 md:space-x-2 animate-bounce-subtle">
                                        <BookmarkCheck size={14} className="md:size-4" />
                                        <span>Last read: Page {lastReadPage + 1}</span>
                                    </div>
                                )}
                            </div>
                            
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                <Viewer 
                                    fileUrl={{
                                        url: pdfUrl,
                                        withCredentials: false
                                    }} 
                                    plugins={[defaultLayoutPluginInstance]} 
                                    initialPage={lastReadPage}
                                    onPageChange={handlePageChange}
                                    defaultScale={SpecialZoomLevel.PageWidth}
                                />
                            </Worker>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BookModal;
