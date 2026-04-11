import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, BookPlus, Loader2, Mail, Send, Sparkles } from 'lucide-react';
import { checkNewsletterSubscription, submitBookRequest } from '../../api/library';

const SUB_DEBOUNCE_MS = 450;

const RequestBook = () => {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [gmail, setGmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle'); // idle | checking | subscribed | not_subscribed | error
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const runSubscriptionCheck = useCallback(async (email) => {
    const trimmed = email.trim();
    if (!trimmed) {
      setSubStatus('idle');
      return;
    }
    setSubStatus('checking');
    try {
      const { subscribed } = await checkNewsletterSubscription(trimmed);
      setSubStatus(subscribed ? 'subscribed' : 'not_subscribed');
    } catch {
      setSubStatus('error');
    }
  }, []);

  useEffect(() => {
    const trimmed = gmail.trim();
    if (!trimmed) {
      setSubStatus('idle');
      return undefined;
    }
    const t = setTimeout(() => {
      runSubscriptionCheck(trimmed);
    }, SUB_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [gmail, runSubscriptionCheck]);

  const handleGmailBlur = () => {
    if (gmail.trim()) runSubscriptionCheck(gmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ type: '', text: '' });
    if (subStatus !== 'subscribed') {
      setFormMessage({
        type: 'error',
        text: 'Only verified newsletter subscribers can request a book. Use the email you subscribed with.',
      });
      return;
    }
    if (!title.trim() || !authorName.trim() || !gmail.trim()) {
      setFormMessage({ type: 'error', text: 'Please fill in book name, author, and your Gmail.' });
      return;
    }
    setSubmitting(true);
    try {
      await submitBookRequest({
        title: title.trim(),
        author_name: authorName.trim(),
        email: gmail.trim(),
      });
      setFormMessage({
        type: 'success',
        text: 'Request received. Thank you — we will review it soon.',
      });
      setTitle('');
      setAuthorName('');
      setGmail('');
      setSubStatus('idle');
    } catch (err) {
      const detail = err.response?.data;
      const msg =
        (typeof detail === 'object' && detail?.email?.[0]) ||
        detail?.detail ||
        detail?.error ||
        'Could not submit your request. Please try again.';
      setFormMessage({ type: 'error', text: Array.isArray(detail?.email) ? detail.email[0] : msg });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldsLocked = subStatus === 'not_subscribed';
  const canSubmit =
    subStatus === 'subscribed' && title.trim() && authorName.trim() && gmail.trim() && !submitting;

  return (
    <div className="pt-32 pb-20 px-6 min-h-screen relative overflow-hidden">
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-primary opacity-10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-md mb-4">
            <Sparkles size={16} className="text-primary" />
            <span className="text-primary text-xs font-black uppercase tracking-widest">Newsletter members only</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-heading tracking-tighter leading-none">
            REQUEST A <span className="text-gradient">BOOK</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto font-medium">
            Can&apos;t find what you&apos;re looking for? Request it here using the same email you verified for our
            newsletter.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-8 md:p-12 border border-glass-border shadow-2xl relative"
        >
          {(subStatus === 'not_subscribed' || subStatus === 'error') && gmail.trim() && (
            <div className="mb-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 flex gap-3 text-left">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={22} />
              <div className="space-y-2">
                <p className="font-bold text-heading text-sm">
                  {subStatus === 'error'
                    ? 'We could not verify your newsletter status.'
                    : 'This email is not on our verified newsletter list.'}
                </p>
                <p className="text-muted text-sm leading-relaxed">
                  Subscribe with this Gmail below, complete the OTP verification, then return here to submit your book
                  request.
                </p>
                <Link
                  to="/#newsletter"
                  className="inline-flex text-sm font-black text-primary uppercase tracking-wide hover:underline"
                >
                  Go to newsletter signup
                </Link>
              </div>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`space-y-2 ${fieldsLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <label className="text-sm font-bold text-heading ml-1">Book name</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Atomic Habits"
                  disabled={fieldsLocked}
                  className="w-full bg-white border border-glass-border rounded-2xl px-6 py-4 text-black outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium disabled:cursor-not-allowed"
                />
              </div>
              <div className={`space-y-2 ${fieldsLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <label className="text-sm font-bold text-heading ml-1">Author name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. James Clear"
                  disabled={fieldsLocked}
                  className="w-full bg-white border border-glass-border rounded-2xl px-6 py-4 text-black outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-heading ml-1 flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                Gmail
              </label>
              <input
                type="email"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                onBlur={handleGmailBlur}
                placeholder="you@gmail.com"
                autoComplete="email"
                className="w-full bg-white border border-glass-border rounded-2xl px-6 py-4 text-black outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
              <div className="flex items-center gap-2 text-xs font-semibold ml-1 min-h-[1.25rem]">
                {subStatus === 'checking' && (
                  <>
                    <Loader2 size={14} className="animate-spin text-primary" />
                    <span className="text-muted">Checking newsletter…</span>
                  </>
                )}
                {subStatus === 'subscribed' && <span className="text-green-600">Verified subscriber — you can request a book.</span>}
                {subStatus === 'idle' && gmail.trim() === '' && (
                  <span className="text-muted">Must match a verified newsletter email.</span>
                )}
              </div>
            </div>

            {formMessage.text && (
              <div
                className={`rounded-2xl px-5 py-3 text-sm font-semibold ${
                  formMessage.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-700'
                    : 'bg-red-500/10 border border-red-500/30 text-red-600'
                }`}
              >
                {formMessage.text}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={!canSubmit}
                className="group relative flex items-center space-x-3 bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100"
              >
                {submitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <span>Request book</span>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center opacity-70">
          <div className="p-6">
            <BookPlus size={24} className="mx-auto mb-3 text-primary" />
            <h4 className="text-heading font-bold text-sm mb-1 uppercase tracking-tight">Community driven</h4>
            <p className="text-xs text-muted">Sourced by bibliophiles</p>
          </div>
          <div className="p-6 border-x border-glass-border">
            <div className="text-2xl font-black text-primary mb-2">24h</div>
            <h4 className="text-heading font-bold text-sm mb-1 uppercase tracking-tight">Review time</h4>
            <p className="text-xs text-muted">Quick processing</p>
          </div>
          <div className="p-6">
            <div className="text-2xl font-black text-primary mb-2">100%</div>
            <h4 className="text-heading font-bold text-sm mb-1 uppercase tracking-tight">Open source</h4>
            <p className="text-xs text-muted">Free for everyone</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestBook;
