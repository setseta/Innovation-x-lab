import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

const benefits = [
  'Unlimited technology news',
  'AI articles and explainers',
  'Startup news and product launches',
  'Gadget reviews and practical guides',
  'Weekly newsletter',
  'Save articles',
  'Like articles',
  'Comment on articles',
  'Follow topics',
  'Personalized homepage',
  'Email notifications',
  'Community discussions',
  'Mobile friendly experience',
];

const excluded = [
  'Premium Reports',
  'Deep AI Research',
  'Exclusive Interviews',
  'Downloadable Guides',
  'Ad-free reading',
  'Early access',
];

const FreeMembershipDetailsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>Free Membership | Innovation X Lab</title>
        <meta name="description" content="Join Innovation X Lab for free and unlock technology news, AI insights, startup updates, and personalized recommendations." />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <section className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/90 to-violet-500/10 p-8 shadow-[0_0_40px_rgba(34,211,238,0.12)] sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200">
            <ShieldCheck size={16} /> Free Membership
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">Join Innovation X Lab Free</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">Create your free account and unlock technology news, AI insights, startup updates, software releases, and personalized recommendations.</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/membership/free/register')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Continue Free
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/membership/free/register?mode=login')}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-cyan-500/10"
            >
              Already have an account? Login
            </button>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Free plan</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-4xl font-semibold text-white">FREE</span>
              <span className="pb-1 text-sm text-slate-400">forever</span>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-400">Start with the essentials and build a richer reading habit with thoughtful daily updates and a personalized feed.</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_35px_rgba(14,165,233,0.08)] sm:p-10">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Included benefits</p>
              <h2 className="text-2xl font-semibold text-white">Everything you need to stay informed</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 size={16} className="mt-0.5 text-cyan-300" />
                <span className="text-sm text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-rose-300">Not included</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {excluded.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-sm text-slate-400">
            <Link to="/membership" className="transition hover:text-cyan-300">Back to plans</Link>
            <span>Modern reading for modern teams</span>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default FreeMembershipDetailsPage;
