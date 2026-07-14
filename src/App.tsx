import { Route, Routes, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUp, Menu, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { labSections } from './data/content';
import HomePage from './pages/HomePage';
import ReviewPage from './pages/ReviewPage';
import ArticlePage from './pages/ArticlePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import ReviewEditorPage from './pages/ReviewEditorPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'AI Lab', href: '/ai-lab' },
    { name: 'Gadget Lab', href: '/gadget-lab' },
    { name: 'Software Lab', href: '/software-lab' },
    { name: 'Code Lab', href: '/code-lab' },
    { name: 'Startup Lab', href: '/startup-lab' },
    { name: 'Review', href: '/review' },
    { name: 'Search', href: '/search' },
    { name: 'Review Admin', href: '/admin/reviews' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Admin', href: '/admin' },
  ];

  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#050816' : '#f8fafc';
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-midnight text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Innovation X Lab</title>
        <meta name="description" content="A premium technology platform exploring AI, gadgets, software, coding, startups, and product reviews." />
      </Helmet>

      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isDark ? 'border-white/10 bg-midnight/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" onClick={() => setMobileNavOpen(false)} className={`group flex items-center whitespace-nowrap text-[0.65rem] font-semibold uppercase tracking-[0.28em] sm:text-[0.78rem] lg:text-[0.92rem] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span className="mr-2 text-white transition duration-300 group-hover:text-slate-100">INNOVATION</span>
            <motion.span
              whileHover={{ scale: 1.08, rotate: -2, filter: 'brightness(1.2)' }}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
              className="relative mx-1 inline-flex items-center bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
            >
              <span className="absolute inset-0 blur-[0.6px] text-cyan-300/40">X</span>
              <span className="relative">X</span>
            </motion.span>
            <span className={`ml-2 text-white/75 transition duration-300 group-hover:text-white/90 ${isDark ? 'text-slate-200/90' : 'text-slate-600'}`}>LAB</span>
          </Link>

          <nav className={`hidden items-center gap-6 text-sm md:flex ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {links.map((link) => (
              <Link key={link.name} to={link.href} className="transition hover:text-cyan-300">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button className={`rounded-full border p-2 ${isDark ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-700'}`} onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className={`rounded-full border p-2 md:hidden ${isDark ? 'border-white/10 text-slate-200' : 'border-slate-200 text-slate-700'}`} onClick={() => setMobileNavOpen((prev) => !prev)}>
              <Menu size={20} />
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className={`border-t px-4 py-4 md:hidden ${isDark ? 'border-white/10 bg-[#060b1b]' : 'border-slate-200 bg-white'}`}>
            <div className={`flex flex-col gap-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {links.map((link) => (
                <Link key={link.name} to={link.href} onClick={() => setMobileNavOpen(false)} className="transition hover:text-cyan-300">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai-lab" element={<CategoryPage category="AI Lab" />} />
          <Route path="/gadget-lab" element={<CategoryPage category="Gadget Lab" />} />
          <Route path="/software-lab" element={<CategoryPage category="Software Lab" />} />
          <Route path="/code-lab" element={<CategoryPage category="Code Lab" />} />
          <Route path="/startup-lab" element={<CategoryPage category="Startup Lab" />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/article" element={<ArticlePage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute><ReviewEditorPage /></ProtectedRoute>} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>

      <footer className={`border-t ${isDark ? 'border-white/10 bg-[#030712]' : 'border-slate-200 bg-slate-100'}`}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Innovation X Lab</h3>
            <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Exploring the technologies shaping tomorrow through premium editorial coverage and expert analysis.</p>
          </div>
          <div>
            <h4 className={`text-sm font-semibold uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Categories</h4>
            <ul className={`mt-4 space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {labSections.map((section) => (
                <li key={section.title}>
                  <Link to={section.href} className="transition hover:text-cyan-300">{section.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={`text-sm font-semibold uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Contact</h4>
            <ul className={`mt-4 space-y-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <li>hello@innovationxlab.com</li>
              <li>+1 (555) 014-7890</li>
              <li>Global HQ · Austin, TX</li>
            </ul>
          </div>
          <div>
            <h4 className={`text-sm font-semibold uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Newsletter</h4>
            <p className={`mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Receive weekly updates on AI breakthroughs, gadgets, and startup innovation.</p>
            <div className="mt-4 flex flex-col gap-2">
              <input className={`rounded-full border px-4 py-3 text-sm outline-none ring-0 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`} placeholder="Email address" />
              <button className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white">Subscribe</button>
            </div>
          </div>
        </div>
      </footer>

      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 p-3 text-white shadow-glow"
        >
          <ArrowUp size={18} />
        </motion.button>
      )}
    </div>
  );
}

export default App;
