import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group"
        >
            <Link 
                to={`/category/${category.slug}`}
                className="block relative overflow-hidden glass-card p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 aspect-video flex flex-col items-center justify-center space-y-4"
            >
                <div className="text-6xl group-hover:scale-125 transition-transform duration-500 drop-shadow-xl">{category.icon_emoji}</div>
                <h3 className="text-2xl font-bold text-heading group-hover:text-primary transition-colors">{category.name}</h3>
                
                <div className="absolute top-4 right-4 animate-pulse">
                    <span className="bg-primary/20 text-primary text-xs font-black px-4 py-1.5 rounded-full border border-primary/30 backdrop-blur-md">
                        {category.book_count}
                    </span>
                </div>

                <div className="absolute -bottom-1 -right-1 p-3 bg-primary bg-opacity-0 group-hover:bg-opacity-100 rounded-tl-2xl transition-all duration-500">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    <path d="M5 12h14m-7-7 7 7-7 7"/>
                   </svg>
                </div>
            </Link>
        </motion.div>
    );
};

export default CategoryCard;
