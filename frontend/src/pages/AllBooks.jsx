import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBooks } from '../api/library';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';
import Loader, { LOADER_DURATION_MS } from '../components/Loader';
import { Search, BookOpen, Filter } from 'lucide-react';

const AllBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const [bks] = await Promise.all([
                    getBooks(),
                    new Promise((resolve) => setTimeout(resolve, LOADER_DURATION_MS)),
                ]);
                setBooks(bks);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <div className="pt-32 pb-20 relative min-h-screen">
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-accent/10 to-transparent pointer-events-none"></div>

            <section className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-accent font-black uppercase tracking-widest text-xs">
                            <BookOpen size={14} />
                            <span>DISCOVER EVERYTHING</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-heading tracking-tighter leading-none italic">
                            COMPLETE <br /> <span className="text-accent not-italic">COLLECTION</span>
                        </h1>
                    </div>

                    <div className="relative group max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-all" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by title or author..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-heading focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all backdrop-blur-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredBooks.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                        {filteredBooks.map((book, idx) => (
                            <BookCard 
                                key={book.id} 
                                book={book} 
                                index={idx} 
                                onView={(b) => setSelectedBook(b)} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 glass-card rounded-[3rem]">
                        <h3 className="text-2xl font-bold text-heading opacity-50 italic">No books found in our archive</h3>
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="mt-6 text-accent font-bold hover:underline"
                        >
                            Reset filters
                        </button>
                    </div>
                )}
            </section>

            {selectedBook && (
                <BookModal 
                    book={selectedBook} 
                    onClose={() => setSelectedBook(null)} 
                />
            )}
        </div>
    );
};

export default AllBooks;
