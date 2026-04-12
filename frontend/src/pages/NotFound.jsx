import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary opacity-10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[0%] right-[-5%] w-[35%] h-[35%] bg-accent opacity-10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-2xl w-full text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative inline-block mb-8">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                                duration: 4, 
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="bg-primary/10 p-8 rounded-[2.5rem] border border-primary/20 backdrop-blur-xl"
                        >
                            <AlertCircle size={80} className="text-primary" />
                        </motion.div>
                        <div className="absolute -top-4 -right-4 bg-accent text-white font-black px-4 py-2 rounded-2xl shadow-xl rotate-12">
                            404
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-heading tracking-tighter mb-6 leading-none">
                        LOST IN THE <br />
                        <span className="text-primary italic">LIBRARY?</span>
                    </h1>

                    <p className="text-xl text-muted font-medium mb-12 max-w-md mx-auto leading-relaxed">
                        The page you are looking for has been archived or moved to a different shelf. 
                        Don't worry, our librarian can help you find your way back.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="group flex items-center gap-3 bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                            >
                                <Home size={20} />
                                BACK TO HOME
                            </motion.button>
                        </Link>
                        
                        <button 
                            onClick={() => window.history.back()}
                            className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 text-heading border border-white/10 font-bold px-8 py-4 rounded-2xl backdrop-blur-md transition-all duration-300"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            GO BACK
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-1/4 left-10 opacity-20 hidden lg:block"
            >
                <div className="text-4xl">📚</div>
            </motion.div>
            <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 7, repeat: Infinity }}
                className="absolute bottom-1/4 right-10 opacity-20 hidden lg:block"
            >
                <div className="text-4xl">🔍</div>
            </motion.div>
        </div>
    );
};

export default NotFound;
