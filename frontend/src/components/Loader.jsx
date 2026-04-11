import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

/** Keep in sync with minimum wait in Home / CategoryPage `Promise.all` timeout */
export const LOADER_DURATION_MS = 2000;

const Loader = ({ durationMs = LOADER_DURATION_MS }) => {
    const durationSec = durationMs / 1000;
    const [percent, setPercent] = useState(0);

    useEffect(() => {
        const start = performance.now();
        let frameId;
        let cancelled = false;

        const tick = (now) => {
            if (cancelled) return;
            const elapsed = now - start;
            const t = Math.min(1, elapsed / durationMs);
            setPercent(t >= 1 ? 100 : Math.floor(t * 100));
            if (t < 1) frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => {
            cancelled = true;
            cancelAnimationFrame(frameId);
        };
    }, [durationMs]);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-navy-900 dark:bg-navy-900 z-[9999]">
            <div className="absolute w-[400px] h-[400px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute w-[200px] h-[200px] bg-accent/10 blur-[100px] rounded-full translate-x-32 -translate-y-20 animate-pulse" />

            <div className="relative flex flex-col items-center space-y-8 z-10">
                <motion.div
                    initial={{ scale: 0, rotateY: 0 }}
                    animate={{ scale: 1, rotateY: 360 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="relative"
                >
                    <div className="p-6 bg-primary/20 rounded-3xl border border-primary/30 backdrop-blur-xl shadow-2xl shadow-primary/30">
                        <motion.div
                            animate={{ rotateY: [0, 15, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <BookOpen size={56} className="text-primary" />
                        </motion.div>
                    </div>

                    <motion.div
                        className="absolute w-3 h-3 bg-accent rounded-full shadow-lg shadow-accent/50"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                        style={{ top: '-8px', left: '50%', transformOrigin: '0 60px' }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 1.0 }}
                    className="text-center"
                >
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">
                        THE OPENSOURCE
                    </h1>
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0, duration: 0.8 }}
                        className="text-3xl md:text-4xl font-black text-gradient tracking-tighter"
                    >
                        LIBRARY
                    </motion.span>
                </motion.div>

                <div className="flex flex-col items-center gap-2 w-72">
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/10">
                        <motion.div
                            className="h-full w-full origin-left rounded-full bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{
                                duration: durationSec,
                                ease: 'linear',
                            }}
                        />
                    </div>
                    <span className="font-mono text-sm font-black tabular-nums text-primary tracking-widest">
                        {percent}%
                    </span>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="text-muted text-[11px] font-black uppercase tracking-[0.6em] opacity-40 text-center"
                >
                    Curating Knowledge For You...
                </motion.p>
            </div>
        </div>
    );
};

export default Loader;
