import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getBooks } from '../api/library';
import CategoryCard from '../components/CategoryCard';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';
import Loader, { LOADER_DURATION_MS } from '../components/Loader';
import { LayoutGrid, Sparkles, BookMarked, GraduationCap, BookOpen, SearchX } from 'lucide-react';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch data and wait at least LOADER_DURATION_MS so the bar reaches 100% before unmount
                const [cats, bks] = await Promise.all([
                    getCategories(),
                    getBooks(searchQuery ? { search: searchQuery } : {}),
                    new Promise((resolve) => setTimeout(resolve, LOADER_DURATION_MS)),
                ]);
                
                setCategories(cats);
                setBooks(bks);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [searchQuery]);

    if (loading) return <Loader />;

    const isSearching = searchQuery.length > 0;

    return (
        <div className="pt-24 pb-20 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute top-[20%] -right-[5%] w-[40%] h-[40%] bg-accent opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Search Results or Hero */}
            {isSearching ? (
                <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-10">
                    <div className="mb-12 space-y-4">
                        <span className="text-primary font-black uppercase tracking-widest text-xs">SEARCH RESULTS</span>
                        <h2 className="text-4xl md:text-6xl font-black text-heading tracking-tighter leading-none">
                            Results for "<span className="text-primary">{searchQuery}</span>"
                        </h2>
                        <p className="text-muted font-medium">{books.length} book{books.length !== 1 ? 's' : ''} found</p>
                    </div>

                    {books.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                            {books.map((book, idx) => (
                                <BookCard 
                                    key={book.id} 
                                    book={book} 
                                    index={idx} 
                                    onView={(b) => setSelectedBook(b)} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 glass-card rounded-3xl">
                            <SearchX size={64} className="mx-auto mb-6 text-muted opacity-30" />
                            <h3 className="text-2xl font-bold text-heading opacity-50">No books found</h3>
                            <p className="text-muted mt-2">Try a different search term</p>
                        </div>
                    )}
                </section>
            ) : (
                <>
                    {/* Hero Section */}
                    <section className="max-w-7xl mx-auto px-4 min-[400px]:px-6 md:px-12 py-20 text-center relative z-10 overflow-x-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 inline-flex max-w-full items-center gap-2 px-3 py-2 sm:px-4 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-md"
                        >
                            <Sparkles size={16} className="text-primary shrink-0" />
                            <span className="text-primary text-[10px] min-[400px]:text-xs font-black uppercase tracking-widest text-left leading-tight">
                                DISCOVER THE FUTURE OF READING
                            </span>
                        </motion.div>
                        
                        <motion.h1 
                            style={{ y: y1 }}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="font-black text-heading leading-[0.92] mb-4 md:mb-8 tracking-tighter text-[clamp(1.5rem,6.2vw+0.85rem,5.25rem)] sm:text-6xl md:text-8xl lg:text-9xl max-w-full mx-auto"
                        >
                            <span className="inline-flex flex-col sm:flex-row sm:flex-wrap sm:whitespace-nowrap items-center justify-center gap-y-0.5 sm:gap-y-0 sm:gap-x-3">
                                <span>THE</span>
                                <span>OPENSOURCE</span>
                            </span>
                            <br />
                            <span className="text-gradient">LIBRARY</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl md:text-2xl text-muted max-w-3xl mx-auto leading-relaxed font-medium mb-12"
                        >
                            Explore thousands of books, research papers, and technical guides. <br className="hidden md:block"/>
                            Completely free, open for all, and designed for curiosity.
                        </motion.p>

                        <div className="flex flex-wrap justify-center gap-12 mt-16 opacity-50">
                            <div className="flex items-center space-x-3 text-muted"><BookMarked size={20}/><span className="font-bold">CURATED</span></div>
                            <div className="flex items-center space-x-3 text-muted"><GraduationCap size={20}/><span className="font-bold">ACADEMIC</span></div>
                            <div className="flex items-center space-x-3 text-muted"><LayoutGrid size={20}/><span className="font-bold">OPEN SOURCE</span></div>
                        </div>
                    </section>

                    {/* Popular Categories */}
                    <section id="popular" className="max-w-7xl mx-auto px-6 md:px-12 mt-20 relative z-10">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-16 space-y-6 md:space-y-0">
                            <div className="space-y-2">
                                <span className="text-primary font-black uppercase tracking-widest text-xs">EXPLORE BY TOPICS</span>
                                <h2 className="text-4xl md:text-6xl font-black text-heading italic tracking-tighter leading-none">POPULAR <br /> <span className="text-primary not-italic">CATEGORIES</span></h2>
                            </div>
                            <p className="text-muted font-medium max-w-sm">From algorithms to ancient history, dive into our curated collections.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {categories.map((cat, idx) => (
                                <CategoryCard key={cat.id} category={cat} index={idx} />
                            ))}
                        </div>
                    </section>

                    {/* Recent Books Grid */}
                    <section id="new" className="max-w-7xl mx-auto px-6 md:px-12 py-32 relative z-10">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-16 space-y-6 md:space-y-0">
                            <div className="space-y-2">
                                <span className="text-accent font-black uppercase tracking-widest text-xs">RECENTLY ADDED</span>
                                <h2 className="text-4xl md:text-6xl font-black text-heading tracking-tighter leading-none">NEW <span className="text-accent">ARRIVALS</span></h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                            {books.map((book, idx) => (
                                <BookCard 
                                    key={book.id} 
                                    book={book} 
                                    index={idx} 
                                    onView={(b) => setSelectedBook(b)} 
                                />
                            ))}
                        </div>
                    </section>


                </>
            )}

            {selectedBook ? (
                <BookModal
                    key={selectedBook.id}
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                />
            ) : null}
        </div>
    );
};

export default Home;
