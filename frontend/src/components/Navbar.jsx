import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getBooks, getMediaUrl } from '../api/library';

const Navbar = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [placeholderTitles, setPlaceholderTitles] = useState(['Psychology of Money', 'Atomic Habits', 'Clean Code', 'Deep Work']);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    // Fetch some real titles for placeholder
    useEffect(() => {
        const fetchInitialTitles = async () => {
            try {
                const books = await getBooks({ limit: 5 });
                if (books.length > 0) {
                    setPlaceholderTitles(books.map(b => b.title));
                }
            } catch (err) {
                console.error("Placeholder fetch error:", err);
            }
        };
        fetchInitialTitles();
    }, []);

    // Rotate placeholder titles
    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex((prev) => (prev + 1) % placeholderTitles.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [placeholderTitles]);
    // Live search suggestions with debouncing
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.trim().length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setIsSearching(true);
            try {
                const results = await getBooks({ search: searchTerm.trim() });
                // Limit to top 5 hits
                setSuggestions(results.slice(0, 5));
                // Always show suggestions box if typing, so we can show "No results found"
                setShowSuggestions(true);
            } catch (err) {
                console.error('Error fetching suggestions:', err);
                setShowSuggestions(false);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm(''); // Clear text after search
            setIsMenuOpen(false);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (bookTitle) => {
        navigate(`/?search=${encodeURIComponent(bookTitle)}`);
        setSearchTerm(''); // Clear text after selection
        setShowSuggestions(false);
        setIsMenuOpen(false);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 navbar-glass py-4 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 group">
                    <img 
                        src="/logo.png" 
                        alt="The Opensource Library Logo" 
                        className="w-10 h-10 object-cover rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20" 
                    />
                    <span className="text-xl font-extrabold tracking-tight hidden sm:block">
                        <span className="text-heading">THE OPENSOURCE </span>
                        <span className="text-primary italic">LIBRARY</span>
                    </span>
                </Link>

                <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative group">
                    <div className="relative w-full">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => {
                                setIsFocused(true);
                                setShowSuggestions(searchTerm.trim().length >= 2);
                            }}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            className="w-full search-input pl-10 pr-12 py-2.5 rounded-full transition-all focus:ring-2 focus:ring-primary/20"
                        />
                        
                        {/* Animated Placeholder Overlay */}
                        <AnimatePresence mode="wait">
                            {!searchTerm && !isFocused && (
                                <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
                                    <motion.div
                                        key={placeholderIndex}
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-muted/60 text-sm font-medium leading-none"
                                    >
                                        Search for "{placeholderTitles[placeholderIndex]}"...
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted group-focus-within:text-primary z-10 transition-colors">
                            <Search size={20} />
                        </div>
                        
                        <AnimatePresence>
                            {searchTerm && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="flex items-center justify-center text-primary transition-all cursor-pointer hover:scale-110 p-1"
                                    >
                                        <X size={20} strokeWidth={2.5} className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                                    </motion.button>
                                </div>
                            )}
                        </AnimatePresence>

                        {isSearching && (
                            <div className={`absolute top-1/2 -translate-y-1/2 ${searchTerm ? 'right-12' : 'right-4'}`}>
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    <AnimatePresence>
                        {showSuggestions && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-[120%] left-0 w-full glass-card rounded-2xl overflow-hidden shadow-2xl z-[60] border border-primary/20 backdrop-blur-xl"
                            >
                                {suggestions.length > 0 ? (
                                    suggestions.map((book) => (
                                        <button
                                            key={book.id}
                                            onClick={() => handleSuggestionClick(book.title)}
                                            className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-primary/10 transition-colors border-b border-white/5 last:border-0 text-left"
                                        >
                                            <img 
                                                src={getMediaUrl(book.cover_image)} 
                                                alt="" 
                                                className="w-8 h-10 object-cover rounded shadow-sm"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-heading truncate">{book.title}</p>
                                                <p className="text-[10px] text-primary uppercase font-black opacity-70">{book.category_name}</p>
                                            </div>
                                            <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </button>
                                    ))
                                ) : !isSearching && (
                                    <div className="px-4 py-6 text-center">
                                        <p className="text-muted text-sm font-medium">No books found matching "<span className="text-primary">{searchTerm}</span>"</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>

                <div className="flex items-center space-x-4">
                    <div className="hidden lg:flex items-center space-x-6 font-medium text-muted">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    </div>

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl theme-toggle-btn transition-all duration-300"
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={24} className="text-heading" /> : <Menu size={24} className="text-heading" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden absolute top-full left-0 w-full mobile-menu p-6 flex flex-col space-y-4 shadow-2xl"
                >
                    <div className="relative">
                        <form onSubmit={handleSearchSubmit} className="relative group">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                    className="w-full search-input p-3 pl-10 pr-12 rounded-xl outline-none"
                                />

                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted z-10">
                                    <Search size={20} />
                                </div>

                                {/* Animated Placeholder Overlay for Mobile */}
                                <AnimatePresence mode="wait">
                                    {!searchTerm && !isFocused && (
                                        <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden">
                                            <motion.div
                                                key={placeholderIndex}
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: -10, opacity: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="text-muted/60 text-xs font-medium leading-none"
                                            >
                                                Search "{placeholderTitles[placeholderIndex]}"...
                                            </motion.div>
                                        </div>
                                    )}
                                </AnimatePresence>
                                
                                <AnimatePresence>
                                    {searchTerm && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                type="button"
                                                onClick={handleClearSearch}
                                                className="flex items-center justify-center text-primary p-1"
                                            >
                                                <X size={20} strokeWidth={2.5} className="drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                                            </motion.button>
                                        </div>
                                    )}
                                </AnimatePresence>

                                {isSearching && (
                                    <div className={`absolute top-1/2 -translate-y-1/2 ${searchTerm ? 'right-12' : 'right-4'}`}>
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </form>

                        <AnimatePresence>
                            {showSuggestions && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 bg-black/5 rounded-xl overflow-hidden border border-primary/10"
                                >
                                    {suggestions.length > 0 ? (
                                        suggestions.map((book) => (
                                            <button
                                                key={book.id}
                                                onClick={() => handleSuggestionClick(book.title)}
                                                className="w-full p-3 flex items-center space-x-3 hover:bg-primary/5 border-b border-black/5 last:border-0 text-left"
                                            >
                                                <img 
                                                    src={getMediaUrl(book.cover_image)} 
                                                    alt="" 
                                                    className="w-8 h-10 object-cover rounded shadow-sm"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-heading truncate">{book.title}</p>
                                                    <p className="text-[10px] text-primary uppercase font-black opacity-70">{book.category_name}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : !isSearching && (
                                        <div className="p-4 text-center">
                                            <p className="text-muted text-xs">No books found matching "{searchTerm}"</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <Link to="/" onClick={() => { setIsMenuOpen(false); setShowSuggestions(false); handleClearSearch(); }} className="text-heading hover:text-primary p-2">Home</Link>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
