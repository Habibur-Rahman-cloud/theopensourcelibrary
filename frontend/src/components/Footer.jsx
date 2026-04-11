import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MapPin, ArrowRight, Heart } from 'lucide-react';
import { GithubIcon, TwitterIcon, InstagramIcon } from 'next-share';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 pt-16 pb-8 px-6 lg:px-12 border-t border-glass-border glass-card overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-12 h-12 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20" 
              />
              <span className="text-xl font-black tracking-tight flex flex-col leading-tight">
                <span className="text-heading">THE OPENSOURCE</span>
                <span className="text-primary italic">LIBRARY</span>
              </span>
            </Link>
            <p className="text-muted text-sm leading-relaxed">
              Empowering the world through open access to knowledge. Our mission is to make quality educational resources available to everyone, everywhere.
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://github.com/Habibur-Rahman-cloud" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-glass-bg border border-glass-border hover:border-primary transition-all shadow-sm flex items-center justify-center">
                <GithubIcon size={18} round />
              </a>
              <a href="https://x.com/habibur_devops" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-glass-bg border border-glass-border hover:border-primary transition-all shadow-sm flex items-center justify-center">
                <TwitterIcon size={18} round />
              </a>
              <a href="https://www.instagram.com/pixelnode_dev/?__pwa=1#" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-glass-bg border border-glass-border hover:border-primary transition-all shadow-sm flex items-center justify-center">
                <InstagramIcon size={18} round />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-heading font-bold mb-6 text-lg">Explore</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/" className="text-muted hover:text-primary transition-colors flex items-center group text-sm">
                  <ArrowRight size={14} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#popular" className="text-muted hover:text-primary transition-colors flex items-center group text-sm">
                  <ArrowRight size={14} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Top Categories
                </Link>
              </li>
              <li>
                <Link to="/#new" className="text-muted hover:text-primary transition-colors flex items-center group text-sm">
                  <ArrowRight size={14} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Latest Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-heading font-bold mb-6 text-lg">Community</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/request-book" className="text-muted hover:text-primary transition-colors flex items-center group text-sm">
                  <ArrowRight size={14} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Request a Book
                </Link>
              </li>
              <li>
                <Link to="/become-contributor" className="text-muted hover:text-primary transition-colors flex items-center group text-sm">
                  <ArrowRight size={14} className="mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  Become a Contributor
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-heading font-bold text-lg mb-6">Connect</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-muted">
                <Mail size={18} className="text-primary mt-1 shrink-0" />
                <a
                  href="mailto:pixelnodecorporations@gmail.com"
                  className="text-sm hover:text-primary transition-colors"
                >
                  pixelnodecorporations@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-3 text-muted">
                <MapPin size={18} className="text-primary mt-1 shrink-0" />
                <span className="text-sm">India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-muted text-center md:text-left">
          <p>© {currentYear} The Opensource Library. All rights reserved.</p>
          <div className="flex items-center">
            Designed with <Heart size={14} className="mx-1 text-red-500 fill-red-500 animate-pulse" /> for the community.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
