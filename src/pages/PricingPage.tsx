import { useEffect, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2, Crown, ShieldCheck } from 'lucide-react';
import { buildApiUrl } from '../config/api';

type Plan = {
  id: string;
  name: string;
  price: number;
  annualPrice?: number;
  billingCycle: string;
  annualBillingCycle?: string;
  buttonLabel: string;
  benefits: string[];
};

type MembershipSummary = {
  plan: string;
  status: string;
  price: number;
  billingCycle: string;
};

type UserProfile = {
  id?: string;
  name?: string;
  email?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  paymentProvider?: string;
  billingCycle?: string;
};

const PricingPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentProviders, setPaymentProviders] = useState<string[]>([]);
  const [mode, setMode] = useState<'login' | 'register'>('login');
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<MembershipSummary | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      const response = await fetch(buildApiUrl('/api/subscriptions/plans'));
      const data = await response.json();
      setPlans(data.plans || []);
      setPaymentProviders(data.paymentProviders || []);
    };

    loadPlans();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(buildApiUrl('/api/subscriptions/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          setSummary(data.summary);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, [token]);

  const handleAuth = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await fetch(buildApiUrl(mode === 'login' ? '/api/auth/login' : '/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Authentication failed');
        return;
      }

      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setUser(data.user);
      setMessage(mode === 'login' ? 'Welcome back to Innovation X Lab.' : 'Account created. You are ready to explore the membership options.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage('Authentication is temporarily unavailable.');
    }
  };

  const handleUpgrade = async (billingCycle: string) => {
    if (!token) {
      setMessage('Sign in to unlock premium access.');
      return;
    }

    setProcessing(true);
    try {
      const checkoutResponse = await fetch(buildApiUrl('/api/subscriptions/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: 'premium', billingCycle, provider: 'Stripe' }),
      });
      const checkoutData = await checkoutResponse.json();
      if (!checkoutResponse.ok) {
        setMessage(checkoutData.error || 'Checkout could not be started.');
        return;
      }

      const confirmResponse = await fetch(buildApiUrl('/api/subscriptions/confirm'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'succeeded', provider: 'Stripe' }),
      });
      const confirmData = await confirmResponse.json();
      if (!confirmResponse.ok) {
        setMessage(confirmData.error || 'Payment confirmation failed.');
        return;
      }

      setMessage(`Premium access confirmed for ${billingCycle === 'annual' ? 'annual' : 'monthly'} billing.`);
      const profileResponse = await fetch(buildApiUrl('/api/subscriptions/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileResponse.json();
      setUser(profileData.user);
      setSummary(profileData.summary);
    } catch (error) {
      setMessage('Payment confirmation could not be completed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/subscriptions/cancel'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Your membership has been cancelled.');
        const profileResponse = await fetch(buildApiUrl('/api/subscriptions/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileResponse.json();
        setUser(profileData.user);
        setSummary(profileData.summary);
      } else {
        setMessage(data.error || 'Unable to cancel membership.');
      }
    } catch (error) {
      setMessage('Cancellation could not be completed.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setSummary(null);
    setMessage('Signed out.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>Pricing | Innovation X Lab</title>
        <meta name="description" content="Explore Innovation X Lab membership plans, premium benefits, and secure subscription options." />
      </Helmet>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Membership</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Explore Technology Beyond The Headlines</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Join Innovation X Lab and access deeper insights into the technologies shaping tomorrow.</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-400">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">Monthly + annual options</span>
            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2">Secure payment support</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Global and South African providers</span>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_0_35px_rgba(14,165,233,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Account access</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Member portal</h2>
            </div>
            {token ? (
              <button onClick={handleLogout} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Sign out</button>
            ) : null}
          </div>

          {message ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{message}</div> : null}

          {!token ? (
            <form onSubmit={handleAuth} className="mt-6 space-y-4">
              <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
                <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === 'login' ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'text-slate-300'}`}>Login</button>
                <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === 'register' ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'text-slate-300'}`}>Register</button>
              </div>
              {mode === 'register' ? <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Full name" /> : null}
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Email address" />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Password" />
              <button type="submit" className="w-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white">{mode === 'login' ? 'Continue to account' : 'Create account'}</button>
            </form>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 p-2 text-white"><Crown size={16} /></div>
                <div>
                  <div className="text-lg font-semibold text-white">{user?.name || 'Member'}</div>
                  <div className="text-sm text-slate-400">{user?.email}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Plan</div>
                  <div className="mt-2 text-base font-semibold text-white">{summary?.plan === 'premium' ? 'Premium' : 'Free'}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</div>
                  <div className="mt-2 text-base font-semibold text-white">{summary?.status || 'active'}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Provider: {user?.paymentProvider || 'Stripe'}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Billing: {summary?.billingCycle || 'monthly'}</span>
              </div>
              {summary?.plan === 'premium' ? (
                <button onClick={handleCancel} className="mt-4 rounded-full border border-rose-400/30 px-4 py-2 text-sm text-rose-300">Cancel membership</button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const isPremium = plan.id === 'premium';
          return (
            <div key={plan.id} className={`rounded-[1.75rem] border p-6 ${isPremium ? 'border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 shadow-[0_0_35px_rgba(34,211,238,0.18)]' : 'border-white/10 bg-slate-900/70'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{isPremium ? 'Professional access for dedicated readers' : 'Perfect for casual technology followers'}</p>
                </div>
                {isPremium ? <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-300"><ShieldCheck size={18} /></div> : null}
              </div>

              <div className="mt-6">
                {plan.id === 'free' ? (
                  <div className="text-4xl font-semibold text-white">$0<span className="text-base font-medium text-slate-400">/month</span></div>
                ) : (
                  <div>
                    <div className="text-4xl font-semibold text-white">${plan.price}<span className="text-base font-medium text-slate-400">/month</span></div>
                    <div className="mt-2 text-sm text-slate-400">Annual: ${plan.annualPrice}/year</div>
                  </div>
                )}
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {plan.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 text-cyan-300" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => (plan.id === 'premium' ? handleUpgrade('monthly') : undefined)}
                className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${isPremium ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'border border-white/10 bg-white/5 text-slate-200'}`}
                disabled={processing && isPremium}
              >
                {plan.buttonLabel}
                <ArrowRight size={15} />
              </button>

              {isPremium ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => handleUpgrade('monthly')} className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200">Monthly • $2/mo</button>
                  <button onClick={() => handleUpgrade('annual')} className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-sm text-violet-200">Annual • $20/yr</button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6">
        <h3 className="text-2xl font-semibold text-white">Supported payment providers</h3>
        <p className="mt-3 text-sm text-slate-400">We support international and regional payment rails for secure subscription checkout.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {paymentProviders.map((provider) => (
            <span key={provider} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">{provider}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
