import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, AlertCircle, Loader2, Key, Send } from 'lucide-react';
import { subscribeNewsletter, verifyNewsletter } from '../api/library';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubscribe = async (e) => {
    if (e) e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      await subscribeNewsletter(email);
      setStatus('idle');
      setIsVerifying(true);
      setMessage('OTP sent to your email');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Something went wrong');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setStatus('loading');
    try {
      await verifyNewsletter(email, otp);
      setStatus('success');
      setMessage('Verified & Subscribed!');
      setEmail('');
      setOtp('');
      setIsVerifying(false);
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Invalid OTP');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <section id="newsletter" className="relative py-24 px-6 overflow-hidden">
        {/* Pink/Purple Glowing Backgrounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-4xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-[2.5rem] p-8 md:p-16 text-center relative border-primary/20 overflow-hidden"
            >
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Mail size={120} className="text-primary -rotate-12" />
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black text-heading mb-6 tracking-tighter italic">
                        JOIN THE <span className="text-primary not-italic tracking-normal">NEWSLETTER</span>
                    </h2>
                    <p className="text-muted text-lg max-w-xl mx-auto mb-5 font-medium">
                        Get notified instantly when new open-source books and research papers are added to our library.
                    </p>
                    <p className="text-muted/75 text-sm sm:text-[0.95rem] max-w-lg mx-auto mb-10 font-medium leading-relaxed">
                        After you verify your subscription, you can also{' '}
                        <Link
                            to="/request-book"
                            className="text-primary font-bold hover:underline underline-offset-2 decoration-primary/40"
                        >
                            request a book
                        </Link>{' '}
                        we don&apos;t have yet, using the same email.
                    </p>

                    <div className="max-w-md mx-auto relative min-h-[100px]">
                        <AnimatePresence mode="wait">
                            {!isVerifying ? (
                                <motion.form 
                                    key="email-form"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    onSubmit={handleSubscribe}
                                    className="flex flex-col sm:flex-row gap-3"
                                >
                                    <div className="flex-grow relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                                        <input 
                                            type="email" 
                                            placeholder="Enter your email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={status === 'loading'}
                                            className="w-full bg-white/5 border border-glass-border focus:border-primary/50 text-heading rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-muted/50 font-semibold"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="bg-primary hover:bg-primary/90 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/25 active:scale-95 disabled:opacity-50"
                                    >
                                        {status === 'loading' ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <>
                                                <span>SUBSCRIBE</span>
                                                <Send size={18} />
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.div 
                                    key="otp-form"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    className="space-y-4"
                                >
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest flex items-center">
                                            <Key size={14} className="mr-2" /> Verify your email
                                        </span>
                                        <button 
                                            onClick={handleSubscribe}
                                            className="text-[10px] text-muted hover:text-primary transition-colors font-bold uppercase underline"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                    <form onSubmit={handleVerify} className="flex gap-3">
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="••••••"
                                            autoFocus
                                            required
                                            disabled={status === 'loading'}
                                            className="flex-grow bg-white/5 border border-glass-border focus:border-primary/50 text-heading rounded-2xl py-4 px-4 outline-none transition-all text-center text-2xl font-black tracking-[0.5em] disabled:opacity-50"
                                        />
                                        <button 
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black px-6 rounded-2xl transition-all flex items-center justify-center group disabled:opacity-50"
                                        >
                                            {status === 'loading' ? (
                                                <Loader2 size={24} className="animate-spin" />
                                            ) : (
                                                <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                                            )}
                                        </button>
                                    </form>
                                    <button 
                                        onClick={() => { setIsVerifying(false); setOtp(''); }}
                                        className="text-[10px] text-muted hover:text-primary transition-colors font-bold uppercase"
                                    >
                                        Wrong email? Change it
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Status Messaging */}
                        <AnimatePresence>
                            {status !== 'idle' && status !== 'loading' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`absolute -bottom-16 left-0 right-0 p-4 rounded-xl flex items-center justify-center space-x-3 border font-bold ${
                                        status === 'success' 
                                        ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                                    }`}
                                >
                                    {status === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    <span>{message}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    </section>
  );
};

export default NewsletterSection;
