import { Route, Routes, Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ChevronDown, Crown, Menu, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { labSections } from './data/content';
import { socialLinks } from './config/social';
import HomePage from './pages/HomePage';
import ReviewPage from './pages/ReviewPage';
import ArticlePage from './pages/ArticlePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import AdvertisePage from './pages/AdvertisePage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import ReviewEditorPage from './pages/ReviewEditorPage';
import MembershipPage from './pages/MembershipPage';
import MembershipDetailsPage from './pages/MembershipDetailsPage';
import MembershipRegisterPage from './pages/MembershipRegisterPage';
import MembershipPaymentPage from './pages/MembershipPaymentPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const storedTheme = window.localStorage.getItem('ixl-theme');
    return storedTheme === 'dark' ? 'dark' : 'light';
  });
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuSection, setMobileMenuSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ixl-theme', theme);
    }
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.backgroundColor = theme === 'dark' ? '#050816' : '#ffffff';
    document.body.style.color = theme === 'dark' ? '#f8fafc' : '#111827';
  }, [theme]);

  const menuSections = useMemo(() => [
    {
      label: 'Articles',
      items: [
        { label: 'Latest Articles', href: '/search' },
        { label: 'AI', href: '/ai-lab' },
        { label: 'Gadgets', href: '/gadget-lab' },
        { label: 'Software', href: '/software-lab' },
        { label: 'Coding', href: '/code-lab' },
        { label: 'Startups', href: '/startup-lab' },
        { label: 'Reviews', href: '/review' },
      ],
    },
    {
      label: 'News',
      items: [
        { label: 'Latest News', href: '/search' },
        { label: 'AI News', href: '/ai-lab' },
        { label: 'Gadget News', href: '/gadget-lab' },
        { label: 'Software News', href: '/software-lab' },
        { label: 'Startup News', href: '/startup-lab' },
        { label: 'Industry News', href: '/about' },
      ],
    },
    {
      label: 'Reviews',
      items: [
        { label: 'Phones', href: '/review' },
        { label: 'Laptops', href: '/review' },
        { label: 'AI Tools', href: '/review' },
        { label: 'Software', href: '/software-lab' },
        { label: 'Accessories', href: '/review' },
      ],
    },
    {
      label: 'Resources',
      items: [
        { label: 'Membership', href: '/membership' },
        { label: 'Newsletter', href: '/membership' },
        { label: 'Search', href: '/search' },
      ],
    },
    {
      label: 'Company',
      items: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ], []);

  const isDark = theme === 'dark';
  const isPremiumMember = (() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const storedSelection = window.localStorage.getItem('membershipSelection');
    if (storedSelection) {
      try {
        const parsedSelection = JSON.parse(storedSelection);
        if (parsedSelection.plan === 'premium') {
          return true;
        }
      } catch (error) {
        console.error('Unable to parse membership selection', error);
      }
    }

    return Boolean(window.localStorage.getItem('authToken'));
  })();

  const toggleNavigationMenu = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileNavOpen((prev) => !prev);
      setDesktopMenuOpen(false);
      return;
    }

    setMobileNavOpen(false);
    setDesktopMenuOpen((prev) => !prev);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-midnight text-slate-100' : 'bg-white text-slate-900'}`}>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Innovation X Lab</title>
        <meta name="description" content="A premium technology platform exploring AI, gadgets, software, coding, startups, and product reviews." />
      </Helmet>

      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${isScrolled ? (isDark ? 'border-white/10 bg-[#050816]/85 shadow-[0_8px_30px_rgba(2,6,23,0.2)]' : 'border-slate-200/80 bg-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.08)]') : (isDark ? 'border-white/10 bg-[#050816]/70' : 'border-slate-200/70 bg-white/80')}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" onClick={() => { setMobileNavOpen(false); setDesktopMenuOpen(false); }} className={`group flex items-center whitespace-nowrap text-[0.65rem] font-semibold uppercase tracking-[0.28em] sm:text-[0.78rem] lg:text-[0.92rem] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <span className={`mr-2 transition duration-300 ${isDark ? 'text-white group-hover:text-slate-100' : 'text-slate-900 group-hover:text-slate-700'}`}>INNOVATION</span>
            <motion.span whileHover={{ scale: 1.08, rotate: -2, filter: 'brightness(1.2)' }} transition={{ type: 'spring', stiffness: 280, damping: 18 }} className="relative mx-1 inline-flex items-center bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]">
              <span className="absolute inset-0 blur-[0.6px] text-cyan-300/40">X</span>
              <span className="relative">X</span>
            </motion.span>
            <span className={`ml-2 transition duration-300 ${isDark ? 'text-white/75 group-hover:text-white/90' : 'text-slate-900 group-hover:text-slate-700'}`}>LAB</span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-2.5">
            <Link to="/search" className={`rounded-full border p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ${isDark ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-200 bg-white/70 text-slate-700'}`} aria-label="Search">
              <Search size={18} />
            </Link>

            <button type="button" className={`inline-flex rounded-full border p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ${isDark ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-200 bg-white/70 text-slate-700'}`} onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))} aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link to="/advertise" className={`hidden rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 sm:inline-flex ${isDark ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-300/70 bg-white/70 text-slate-700'}`}>
              Advertise With Us
            </Link>

            <Link to="/membership" className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,165,233,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 ${isDark ? 'focus-visible:ring-offset-[#050816]' : 'focus-visible:ring-offset-white'}`} aria-label={isPremiumMember ? 'Open premium membership' : 'Open membership'}>
              <Crown size={16} className="shrink-0" />
              <span className="hidden sm:inline">{isPremiumMember ? 'Premium Member' : 'Membership'}</span>
              <span className="sm:hidden">{isPremiumMember ? 'Premium' : 'Join'}</span>
            </Link>

            <div className="relative">
              <button type="button" onClick={toggleNavigationMenu} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ${isDark ? 'border-white/10 bg-white/5 text-slate-200' : 'border-slate-300/70 bg-white/70 text-slate-700'}`} aria-label="Open navigation" aria-expanded={desktopMenuOpen} aria-controls="site-navigation-panel">
                <Menu size={18} />
                <span className="hidden sm:inline">Menu</span>
              </button>

              <AnimatePresence>
                {desktopMenuOpen && (
                  <motion.div id="site-navigation-panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }} className={`absolute right-0 top-full mt-3 w-[280px] rounded-[1.25rem] border p-4 shadow-2xl backdrop-blur-xl ${isDark ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white/95'}`}>
                    <div className="space-y-2">
                      <Link to="/" onClick={() => setDesktopMenuOpen(false)} className={`block rounded-full px-3 py-2 text-sm font-medium transition ${isDark ? 'text-slate-200 hover:bg-white/5 hover:text-cyan-300' : 'text-slate-700 hover:bg-slate-100 hover:text-cyan-600'}`}>
                        Home
                      </Link>

                      {menuSections.map((section) => (
                        <div key={section.label} className={`rounded-[1rem] border px-3 py-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                          <p className={`mb-2 text-[0.7rem] font-semibold uppercase tracking-[0.28em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{section.label}</p>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <Link key={item.label} to={item.href} onClick={() => setDesktopMenuOpen(false)} className={`block rounded-full px-3 py-2 text-sm transition ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-cyan-300' : 'text-slate-700 hover:bg-slate-100 hover:text-cyan-600'}`}>
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}

                      <Link to="/advertise" onClick={() => setDesktopMenuOpen(false)} className={`block rounded-full border px-3 py-2 text-sm font-medium transition ${isDark ? 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/40 hover:text-cyan-300' : 'border-slate-300/70 bg-white/70 text-slate-700 hover:border-cyan-400/40 hover:text-cyan-600'}`}>
                        Advertise With Us
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`overflow-hidden border-t lg:hidden ${isDark ? 'border-white/10 bg-[#060b1b]' : 'border-slate-200 bg-white'}`}>
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                <div className="space-y-2">
                  <Link to="/membership" onClick={() => setMobileNavOpen(false)} className={`block rounded-[1rem] border bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(14,165,233,0.24)] ${isDark ? 'border-cyan-400/20' : 'border-cyan-400/20'}`}>
                    {isPremiumMember ? 'Premium Member' : 'Join Membership'}
                  </Link>

                  <Link to="/" onClick={() => setMobileNavOpen(false)} className={`block rounded-[1rem] border px-4 py-3 text-sm font-medium ${isDark ? 'border-white/10 bg-white/5 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>Home</Link>

                  {menuSections.map((section) => (
                    <div key={section.label} className={`overflow-hidden rounded-[1rem] border ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                      <button type="button" onClick={() => setMobileMenuSection((prev) => (prev === section.label ? null : section.label))} className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                        {section.label}
                        <ChevronDown size={16} />
                      </button>

                      {mobileMenuSection === section.label && (
                        <div className={`border-t px-3 py-3 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                          <div className="space-y-1">
                            {section.items.map((item) => (
                              <Link key={item.label} to={item.href} onClick={() => setMobileNavOpen(false)} className={`block rounded-full px-3 py-2 text-sm ${isDark ? 'text-slate-300 hover:bg-white/5 hover:text-cyan-300' : 'text-slate-700 hover:bg-slate-100 hover:text-cyan-600'}`}>
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <Link to="/advertise" onClick={() => setMobileNavOpen(false)} className={`block rounded-[1rem] border px-4 py-3 text-sm font-medium ${isDark ? 'border-white/10 bg-white/5 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>Advertise With Us</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
          <Route path="/advertise" element={<AdvertisePage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/membership/:plan" element={<MembershipDetailsPage />} />
          <Route path="/membership/free" element={<MembershipRegisterPage plan="free" />} />
          <Route path="/membership/premium" element={<MembershipRegisterPage plan="premium" />} />
          <Route path="/membership/payment" element={<MembershipPaymentPage />} />
          <Route path="/payment/success" element={<PaymentStatusPage />} />
          <Route path="/payment/cancel" element={<PaymentStatusPage />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute><ReviewEditorPage /></ProtectedRoute>} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>

      <footer className={`border-t ${isDark ? 'border-white/10 bg-[#030712]' : 'border-slate-200 bg-white'}`}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Innovation X Lab</h3>
            <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Exploring the technologies shaping tomorrow through premium editorial coverage and expert analysis.</p>
            <div className="mt-6">
              <h4 className={`text-sm font-semibold uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Follow Innovation X Lab</h4>
              <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                {socialLinks.map(({ href, icon: Icon, ariaLabel, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={ariaLabel}
                    className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-slate-900/90 text-slate-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition duration-300 hover:scale-110 hover:border-blue-400/50 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer`}
                  >
                    <Icon size={18} className="transition duration-300" />
                  </a>
                ))}
              </div>
            </div>
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
              <li>Global</li>
              <li><Link to="/advertise" className="transition hover:text-cyan-300">Advertise With Us</Link></li>
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
