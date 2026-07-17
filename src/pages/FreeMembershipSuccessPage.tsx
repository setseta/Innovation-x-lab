import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

const FreeMembershipSuccessPage = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowConfetti(false), 2000);
    const redirectTimer = window.setTimeout(() => navigate('/'), 10000);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>Welcome to Innovation X Lab</title>
        <meta name="description" content="Your free membership has been activated successfully." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full overflow-hidden rounded-[2.2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/70 p-8 shadow-[0_0_45px_rgba(34,211,238,0.16)] sm:p-10"
      >
        <AnimatePresence>
          {showConfetti ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              {[...Array(18)].map((_, index) => (
                <motion.span
                  key={index}
                  initial={{ y: -20, opacity: 0, scale: 0.8 }}
                  animate={{ y: 320, opacity: [0, 1, 0], x: (index % 2 === 0 ? 1 : -1) * (index % 4) * 60, rotate: 360 }}
                  transition={{ duration: 1.8, delay: index * 0.04, ease: 'easeOut' }}
                  className={`absolute left-1/2 top-0 h-3 w-3 rounded-full ${index % 2 === 0 ? 'bg-cyan-400' : 'bg-violet-500'}`}
                />
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1, rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
          >
            <CheckCircle2 size={44} />
          </motion.div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">
            <Sparkles size={15} /> Welcome aboard
          </div>

          <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">Welcome to Innovation X Lab!</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">Your free membership has been activated successfully.</p>

          <div className="mt-8 grid gap-3 rounded-[1.6rem] border border-white/10 bg-white/5 p-6 text-left sm:grid-cols-2">
            {[
              'Unlimited Tech News',
              'AI Coverage',
              'Startup Updates',
              'Weekly Newsletter',
              'Personalized Feed',
              'Save Articles',
              'Comments',
              'Follow Topics',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                <Trophy size={15} className="text-cyan-300" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
              Start Reading <ArrowRight size={15} />
            </Link>
            <Link to="/search" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
              Explore Latest News
            </Link>
            <Link to="/" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-cyan-500/10">
              Go To Homepage
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-400">You will be redirected to the homepage in a few moments if you do not choose an option.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default FreeMembershipSuccessPage;
