import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Crown, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';

const MembershipDetailsPage = () => {
  const navigate = useNavigate();
  const { plan } = useParams<{ plan: string }>();
  const isPremium = plan === 'premium';

  const benefits = isPremium
    ? [
        'Everything in Free',
        'Premium technology reports',
        'Deep AI analysis',
        'Exclusive startup insights',
        'Early access articles',
        'Ad-free reading',
        'Premium newsletter',
        'Downloadable technology guides',
        'Member-only content',
      ]
    : [
        'Access to free technology articles',
        'Latest AI breakthroughs',
        'Gadget updates',
        'Software and coding insights',
        'Startup news',
        'Weekly newsletter',
        'Public reviews',
      ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>{isPremium ? 'Premium Membership' : 'Free Membership'} | Innovation X Lab</title>
        <meta name="description" content={isPremium ? 'Unlock premium technology reporting and exclusive insights with Innovation X Lab.' : 'Join Innovation X Lab with a free membership for curated technology updates.'} />
      </Helmet>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_35px_rgba(14,165,233,0.08)]"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300">
              {isPremium ? <Crown size={18} /> : <ShieldCheck size={18} />}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">{isPremium ? 'Premium Membership' : 'Free Membership'}</p>
              <h1 className="mt-1 text-3xl font-semibold text-white">{isPremium ? 'Innovation X Premium' : 'Innovation X Free'}</h1>
            </div>
          </div>

          <p className="mt-8 text-lg leading-8 text-slate-300">
            {isPremium
              ? 'Get a more immersive technology experience with premium reports, deep analysis, and a distraction-free reading ritual.'
              : 'Stay informed with the latest breakthroughs, reviews, and curated updates from the Innovation X Lab editorial team.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-400">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">{isPremium ? 'Member-only research' : 'Weekly coverage'}</span>
            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2">{isPremium ? 'Priority access' : 'Daily stories'}</span>
          </div>

          <div className="mt-10 space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Benefits</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 text-cyan-300" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Who it is for</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {isPremium
                  ? 'Ideal for readers who want rigorous analysis, deeper research, and a premium technology subscription experience.'
                  : 'Perfect for curious readers who want a steady stream of clear, practical technology news without the noise.'}
              </p>
            </div>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="rounded-[1.75rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 shadow-[0_0_35px_rgba(34,211,238,0.14)]"
        >
          {isPremium ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Premium pricing</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Flexible membership</h2>
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200">Best Value</span>
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Monthly</p>
                  <div className="mt-3 text-4xl font-semibold text-white">$2<span className="text-base font-medium text-slate-400">/month</span></div>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Annual</p>
                  <div className="mt-3 text-4xl font-semibold text-white">$20<span className="text-base font-medium text-slate-400">/year</span></div>
                  <p className="mt-2 text-sm text-slate-400">Save $4 with annual membership</p>
                </div>
              </div>

              <button onClick={() => navigate('/membership')} className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white">
                Continue to payment
                <ArrowRight size={15} />
              </button>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-white">Frequently asked questions</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-white">How do I access premium content?</p>
                    <p className="mt-1 text-slate-400">After checkout, your account unlocks premium articles immediately.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Which payment methods are supported?</p>
                    <p className="mt-1 text-slate-400">We support Stripe, PayPal, PayFast, Yoco, Peach Payments, and Paystack.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Free membership</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Get started instantly</h2>
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200">No cost</span>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6">
                <p className="text-sm leading-7 text-slate-400">Create a free account to receive weekly insights, public reviews, and access to the latest technology updates.</p>
                <button onClick={() => navigate('/membership')} className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100">
                  Sign up for free
                  <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}
        </motion.aside>
      </div>

      <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
        <Link to="/membership" className="transition hover:text-cyan-300">Back to membership</Link>
      </div>
    </div>
  );
};

export default MembershipDetailsPage;
