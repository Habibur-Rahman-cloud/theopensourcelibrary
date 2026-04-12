import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Eye, ArrowLeft, Bookmark, Calendar, Inbox } from 'lucide-react';
import axios from 'axios';
import Loader from '../components/Loader';
import { getMediaUrl } from '../api/library';
import { trackPDFInteraction } from '../utils/analytics';

const BookDetails = () => {
    const { slug } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const pdfUrl = getMediaUrl(book.pdf_file, book.id);

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
                        <button 
                            onClick={() => {
                                trackPDFInteraction('open', book);
                                window.open(pdfUrl, '_blank');
                            }}
                            className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg shadow-xl shadow-primary/20 group hover:scale-[1.02] transition-transform"
                        >
                            <Eye size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="font-black uppercase tracking-tight">READ ONLINE</span>
                        </button>
                        <a 
                            href={pdfUrl} 
                            download 
                            onClick={() => trackPDFInteraction('download', book)}
                            className="btn-outline w-full sm:w-auto flex items-center justify-center space-x-3 py-5 px-10 text-lg group hover:scale-[1.02] transition-transform"
                        >
                            <Download size={24} className="group-hover:translate-y-0.5 transition-transform" />
                            <span className="font-black uppercase tracking-tight">DOWNLOAD</span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BookDetails;
