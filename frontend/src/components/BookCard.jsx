import React from 'react';
import { motion } from 'framer-motion';
import { LayoutTemplate } from 'lucide-react';
import { getMediaUrl } from '../api/library';
import { trackBookClick } from '../utils/analytics';

const BookCard = ({ book, index, onView }) => {
    const handleClick = () => {
        trackBookClick(book);
        onView(book);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            viewport={{ once: true }}
            className="group cursor-pointer"
            onClick={handleClick}
        >
            {/* Book Cover */}
            <div className="relative overflow-hidden rounded-2xl aspect-[2/3] bg-navy-800 shadow-lg shadow-black/30 group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-500">
                <img 
                    src={getMediaUrl(book.cover_image)}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary flex items-center space-x-2 py-3 px-6 rounded-xl font-bold shadow-xl shadow-primary/30"
                    >
                        <LayoutTemplate size={20} />
                        <span>View Book</span>
                    </motion.button>
                </div>

                {/* Category badge */}
                <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-primary/90 text-white px-3 py-1 rounded-full backdrop-blur-sm shadow-lg">
                        {book.category_name}
                    </span>
                </div>
            </div>

            {/* Title only */}
            <div className="mt-4 px-1">
                <h3 className="text-lg font-bold text-white dark:text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    {book.title}
                </h3>
            </div>
        </motion.div>
    );
};

export default BookCard;
