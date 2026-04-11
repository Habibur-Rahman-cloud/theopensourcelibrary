import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Upload, Zap } from 'lucide-react';

const BecomeContributor = () => {
  return (
    <div className="pt-32 pb-20 px-6 min-h-screen relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -bottom-[20%] -right-[15%] w-[60%] h-[60%] bg-accent opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-8"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20 backdrop-blur-md">
              <Award size={16} className="text-accent" />
              <span className="text-accent text-xs font-black uppercase tracking-widest">Share knowledge globally</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-heading tracking-tighter leading-[0.9]">
              BECOME A <br /> <span className="text-accent">CONTRIBUTOR</span>
            </h1>
            <p className="text-muted text-xl max-w-lg font-medium leading-relaxed">
              Help us expand our collection and democratize education for everyone. Our contributors are the backbone of this library.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="w-full md:w-[400px] aspect-square relative"
          >
            <div className="absolute inset-0 bg-accent/20 blur-3xl animate-pulse -z-10"></div>
            <div className="glass-card rounded-[40px] w-full h-full border border-glass-border shadow-2xl flex items-center justify-center p-12">
               <div className="relative">
                 <div className="absolute -top-12 -left-12 p-6 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20 rotate-[-12deg]">
                   <Upload size={32} />
                 </div>
                 <div className="absolute -bottom-12 -right-12 p-8 rounded-[32px] bg-accent text-white shadow-xl shadow-accent/20 rotate-[12deg]">
                   <GraduationCap size={32} />
                 </div>
                 <div className="p-12 border-8 border-glass-border/30 rounded-full animate-spin-slow">
                    <Zap size={64} className="text-heading" />
                 </div>
               </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-10 border border-glass-border hover:border-accent transition-all group"
          >
            <h3 className="text-2xl font-black text-heading mb-4 group-hover:text-accent transition-colors italic uppercase tracking-tighter">1. SUBMISSION</h3>
            <p className="text-muted leading-relaxed font-medium">
              Simply upload high-quality PDFs and provide accurate metadata about the resource. Every submission goes through a quality check.
            </p>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="glass-card rounded-3xl p-10 border border-glass-border hover:border-primary transition-all group"
          >
            <h3 className="text-2xl font-black text-heading mb-4 group-hover:text-primary transition-colors italic uppercase tracking-tighter">2. IMPACT</h3>
            <p className="text-muted leading-relaxed font-medium">
              Join a global network of educators and students. Your contribution becomes freely accessible to anyone with an internet connection.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 flex justify-center">
           <button className="bg-heading text-bg px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl">
             Launch Contribution Portal
           </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeContributor;
