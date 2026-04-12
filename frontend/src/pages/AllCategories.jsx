import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCategories } from '../api/library';
import CategoryCard from '../components/CategoryCard';
import Loader, { LOADER_DURATION_MS } from '../components/Loader';
import { Search, LayoutGrid } from 'lucide-react';

const AllCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCats = async () => {
            setLoading(true);
            try {
                const [cats] = await Promise.all([
                    getCategories(),
                    new Promise((resolve) => setTimeout(resolve, LOADER_DURATION_MS)),
                ]);
                setCategories(cats);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCats();
    }, []);

    const filteredCategories = categories.filter(cat => 
        (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <div className="pt-32 pb-20 relative min-h-screen">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
            
            <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                            <LayoutGrid size={14} />
                            <span>BROWSE ALL TOPICS</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-heading tracking-tighter leading-none italic">
                            LIBRARY <br /> <span className="text-primary not-italic">CATEGORIES</span>
                        </h1>
                    </div>

                    <div className="relative group max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search categories..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-heading focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all backdrop-blur-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredCategories.map((cat, idx) => (
                            <CategoryCard key={cat.id} category={cat} index={idx} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 glass-card rounded-[3rem]">
                        <h3 className="text-2xl font-bold text-heading opacity-50 italic">No categories match your search</h3>
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-6 text-primary font-bold hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AllCategories;
