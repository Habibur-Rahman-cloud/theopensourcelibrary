import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBooks, getCategories } from '../api/library';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';
import Loader, { LOADER_DURATION_MS } from '../components/Loader';
import { ArrowLeft, Filter, Sparkles, BookCopy } from 'lucide-react';

const CategoryPage = () => {
    const { slug } = useParams();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);
    const [category, setCategory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [booksData, catsData] = await Promise.all([
                    getBooks({ category: slug }),
                    getCategories(),
                    new Promise((resolve) => setTimeout(resolve, LOADER_DURATION_MS)),
                ]);
                setBooks(booksData);
                const currentCat = catsData.find(c => c.slug === slug);
                setCategory(currentCat);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    if (loading) return <Loader />;

    return (
        <div className="pt-32 pb-20 max-w-7xl mx-auto px-6 md:px-12 relative">
             <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary opacity-5 blur-[150px] rounded-full pointer-events-none"></div>

             <Link to="/" className="inline-flex items-center space-x-2 text-muted hover:text-primary transition-all group font-bold mb-12 py-3 px-6 glass-card rounded-2xl active:scale-95">
                <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                <span>BACK TO HOME</span>
             </Link>

             <div className="flex flex-col md:flex-row items-end justify-between mb-20 space-y-8 md:space-y-0">
                <div className="space-y-4">
                    <div className="inline-flex items-center space-x-2 p-1 px-3 bg-primary/10 rounded-lg text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                       <Sparkles size={12}/>
                       <span className="italic">{slug.replace('-', ' ')}</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-heading leading-none tracking-tighter">
                        {category?.name || slug} <br />
                        <span className="text-gradient">COLLECTION</span>
                    </h1>
                </div>

                <div className="flex flex-col items-end text-right">
                    <div className="flex items-center space-x-6 mb-4">
                        <Filter size={24} className="text-muted" />
                        <span className="text-2xl font-black text-heading italic">{books.length} BOOKS FOUND</span>
                    </div>
                    <p className="max-w-xs text-muted font-medium opacity-80 leading-relaxed">{category?.description || 'Refine your expertise with our handpicked academic sources and guides.'}</p>
                </div>
             </div>

             {books.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8 relative z-10">
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
                <div className="text-center py-40 glass-card rounded-[3rem] border-dashed border-white/10">
                    <BookCopy size={64} className="mx-auto mb-6 text-muted opacity-20" />
                    <h2 className="text-3xl font-black text-heading opacity-40">No books found in this collection.</h2>
                    <p className="text-muted mt-2">Try exploring other categories or check back later.</p>
                </div>
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

export default CategoryPage;
