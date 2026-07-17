import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Crown, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

type MembershipPlan = 'free' | 'premium';

type AuthMode = 'login' | 'register';

type BillingCycle = 'monthly' | 'annual';

const MembershipPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [mode, setMode] = useState<AuthMode>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem('authToken');
  });
  const [processing, setProcessing] = useState(false);

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    navigate(plan === 'free' ? '/membership/free' : '/membership/premium');
  };

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setProcessing(true);

    try {
      const requestBody = mode === 'login'
        ? { email, password }
        : { name, email, password, membershipPlan: selectedPlan || 'free', billingCycle };

      const response = await fetch(buildApiUrl(mode === 'login' ? '/api/auth/login' : '/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Authentication failed.');
        return;
      }

      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setName('');
      setEmail('');
      setPassword('');

      if (selectedPlan === 'free') {
        setMessage('Your free account is ready.');
        navigate('/membership/free');
      } else {
        setMessage('Account created. Continue to payment.');
        navigate('/membership/premium');
      }
    } catch (error) {
      setMessage('Authentication is temporarily unavailable.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>Membership | Innovation X Lab</title>
        <meta name="description" content="Join Innovation X Lab with a free or premium membership tailored for modern technology readers." />
      </Helmet>

      <div className="space-y-10">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Membership</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Explore Technology Beyond The Headlines</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Choose your membership and unlock access to technology insights, research, and exclusive content from Innovation X Lab.</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-400">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">Free access to weekly updates</span>
              <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2">Premium analysis and guides</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Secure global checkout</span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_0_45px_rgba(34,211,238,0.12)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Member experience</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Select a membership</h2>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300">
                <Crown size={18} />
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">Start with the plan that fits your reading habits. Premium unlocks deeper research, ad-free access, and guided downloads.</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_35px_rgba(14,165,233,0.08)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Free membership</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">Innovation X Free</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 p-2 text-cyan-300">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="mt-8 text-4xl font-semibold text-white">$0<span className="text-base font-medium text-slate-400">/month</span></div>

            <ul className="mt-8 space-y-3 text-sm text-slate-300">
              {[
                'Access to free technology articles',
                'Latest AI breakthroughs',
                'Gadget updates',
                'Software and coding insights',
                'Startup news',
                'Weekly newsletter',
                'Public reviews',
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="mt-0.5 text-cyan-300" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan('free')}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-cyan-500/10"
            >
              Continue With Free
              <ArrowRight size={15} />
            </button>
          </motion.article>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-[1.75rem] border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 shadow-[0_0_35px_rgba(34,211,238,0.18)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Premium membership</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">Innovation X Premium</h3>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300">
                <Crown size={18} />
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200">Best Value</span>
              <span className="text-sm text-slate-400">Flexible monthly or annual billing</span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`rounded-full px-3 py-2 text-sm ${billingCycle === 'monthly' ? 'bg-cyan-500/10 text-cyan-200' : 'text-slate-300'}`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`rounded-full px-3 py-2 text-sm ${billingCycle === 'annual' ? 'bg-violet-500/10 text-violet-200' : 'text-slate-300'}`}
                >
                  Annual
                </button>
              </div>
            </div>

            <div className="mt-6">
              <motion.div
                key={billingCycle}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32 }}
                className="text-4xl font-semibold text-white"
              >
                {billingCycle === 'monthly' ? (
                  <>
                    $2<span className="text-base font-medium text-slate-400">/month</span>
                  </>
                ) : (
                  <>
                    $20<span className="text-base font-medium text-slate-400">/year</span>
                  </>
                )}
              </motion.div>
              {billingCycle === 'annual' ? <p className="mt-2 text-sm text-slate-400">Save $4 with annual membership</p> : null}
            </div>

            <ul className="mt-8 space-y-3 text-sm text-slate-300">
              {[
                'Everything in Free',
                'Premium technology reports',
                'Deep AI analysis',
                'Exclusive startup insights',
                'Early access articles',
                'Ad-free reading',
                'Premium newsletter',
                'Downloadable technology guides',
                'Member-only content',
              ].map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="mt-0.5 text-cyan-300" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan('premium')}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Start Premium Membership
              <ArrowRight size={15} />
            </button>
          </motion.article>
        </section>

        <AnimatePresence mode="wait">
          {selectedPlan ? (
            <motion.section
              key={selectedPlan}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.25 }}
              className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_0_35px_rgba(14,165,233,0.08)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Continue setup</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">{selectedPlan === 'free' ? 'Create your free account' : 'Create your premium account'}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Choose a sign-in method and we will take you straight into your membership experience.</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                  {selectedPlan === 'free' ? 'Free access immediately' : 'Secure checkout next'}
                </div>
              </div>

              {message ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{message}</div> : null}

              {!token ? (
                <form onSubmit={handleAuth} className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
                  <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1 lg:col-span-3">
                    <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === 'register' ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'text-slate-300'}`}>
                      Register
                    </button>
                    <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === 'login' ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'text-slate-300'}`}>
                      Login
                    </button>
                  </div>

                  {mode === 'register' ? <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Full name" /> : null}
                  <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Email address" />
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Password" />
                  <button type="submit" disabled={processing} className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white lg:col-span-3 lg:w-auto lg:px-6">
                    {processing ? 'Working...' : mode === 'register' ? 'Create account' : 'Continue to account'}
                  </button>
                </form>
              ) : (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button onClick={() => navigate(selectedPlan === 'free' ? '/membership/free' : '/membership/premium')} className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white">
                    Continue to membership
                  </button>
                </div>
              )}
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MembershipPage;
