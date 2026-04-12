import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NewsletterSection from './components/NewsletterSection';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import RequestBook from './pages/support/RequestBook';
import BecomeContributor from './pages/support/BecomeContributor';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import NotFound from './pages/NotFound';
import AllCategories from './pages/AllCategories';
import AllBooks from './pages/AllBooks';
import { trackPageView } from './utils/analytics';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/request-book" element={<RequestBook />} />
        <Route path="/become-contributor" element={<BecomeContributor />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/categories" element={<AllCategories />} />
        <Route path="/books" element={<AllBooks />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function ScrollHandler() {
  const location = useLocation();
  
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);
  
  return null;
}

function AnalyticsHandler() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ScrollHandler />
        <AnalyticsHandler />
        <div className="min-h-screen flex flex-col app-bg text-body selection:bg-primary selection:text-white transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
          <NewsletterSection />
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
