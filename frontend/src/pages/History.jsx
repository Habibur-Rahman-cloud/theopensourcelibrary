import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Trash2 } from 'lucide-react';
import { getAllReadingHistory, clearReadingProgress, getReadingProgress } from '../utils/readingProgress';
import { getMediaUrl } from '../api/library';

const History = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = () => {
        const data = getAllReadingHistory();
        setHistory(data);
    };

    const handleRemove = (slug, e) => {
        e.preventDefault();
        e.stopPropagation();
        clearReadingProgress(slug);
        loadHistory();
    };

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <Link to="/" className="inline-flex items-center space-x-2 text-muted hover:text-primary transition-colors mb-8 group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold uppercase tracking-widest text-sm">Back to Library</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl md:text-5xl font-black text-heading mb-4">Reading History</h1>
                <p className="text-muted text-lg mb-12">Continue reading from where you left off</p>

                {history.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen size={64} className="mx-auto text-white/10 mb-6" />
                        <h2 className="text-2xl font-bold text-heading mb-2">No reading history yet</h2>
                        <p className="text-muted mb-8">Start reading books to see them here</p>
                        <Link to="/" className="btn-primary inline-flex items-center space-x-2">
                            <span>Browse Books</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((item, index) => (
                            <motion.div
                                key={item.slug}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/book/${item.slug}`}
                                    className="group block bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex p-4 gap-4">
                                        {/* Book Cover */}
                                        <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-navy-900">
                                            {item.cover ? (
                                                <img
                                                    src={getMediaUrl(item.cover)}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                                    <BookOpen size={24} className="text-primary/50" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Book Info */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-primary text-xs font-black uppercase tracking-wider">
                                                        {item.category || 'Book'}
                                                    </span>
                                                    <h3 className="font-bold text-heading mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                                                        {item.title}
                                                    </h3>
                                                </div>
                                                <button
                                                    onClick={(e) => handleRemove(item.slug, e)}
                                                    className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0"
                                                    title="Remove from history"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 mt-3 text-white/50 text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <BookOpen size={14} />
                                                    <span>Page {item.page}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    <span>{formatDate(item.lastRead)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <span className="inline-flex items-center text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                                                    Resume Reading
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default History;
