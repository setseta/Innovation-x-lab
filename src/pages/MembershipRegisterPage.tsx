import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Crown, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

type MembershipRegisterPageProps = {
  plan: 'free' | 'premium';
};

type BillingCycle = 'monthly' | 'annual';

const MembershipRegisterPage = ({ plan }: MembershipRegisterPageProps) => {
  const navigate = useNavigate();
  const params = useParams<{ plan?: string }>();
  const resolvedPlan = (params.plan || plan || 'free') as 'free' | 'premium';
  const isPremium = resolvedPlan === 'premium';
  const [mode, setMode] = useState<'register' | 'login'>(() => {
    if (typeof window === 'undefined') {
      return 'register';
    }

    return window.location.search.includes('mode=login') ? 'login' : 'register';
  });
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('United States');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  useEffect(() => {
    const savedSelection = window.localStorage.getItem('membershipSelection');
    if (!savedSelection) {
      return;
    }

    try {
      const parsedSelection = JSON.parse(savedSelection);
      if (parsedSelection.billingCycle === 'monthly' || parsedSelection.billingCycle === 'annual') {
        setBillingCycle(parsedSelection.billingCycle);
      }
    } catch (error) {
      console.error('Unable to restore membership billing cycle', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      navigate(isPremium ? '/membership/payment' : '/membership/free/success');
    }
  }, [navigate, isPremium]);

  const persistSelection = (nextBillingCycle: BillingCycle) => {
    window.localStorage.setItem('membershipSelection', JSON.stringify({ plan: resolvedPlan, billingCycle: nextBillingCycle }));
  };

  const benefits = useMemo(() => isPremium
    ? [
        'Deep technology analysis',
        'Member-only research reports',
        'Early access to editorial releases',
        'Premium newsletter editions',
      ]
    : [
        'Free weekly technology updates',
        'Editorial highlights and recaps',
        'Public reviews and latest insights',
        'Access to the Innovation X Lab newsletter',
      ], [isPremium]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!name.trim()) {
      setMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setMessage('Please enter your email address.');
      return;
    }

    if (!password || password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    if (!acceptTerms) {
      setMessage('Please accept the terms to continue.');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim() || undefined,
          email: email.trim(),
          password,
          confirmPassword,
          country,
          newsletterPreference: subscribeNewsletter ? 'premium' : 'free',
          membershipPlan: resolvedPlan,
          billingCycle,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Registration failed.');
        return;
      }

      localStorage.setItem('authToken', data.token);
      if (resolvedPlan === 'free') {
        navigate('/membership/free/success');
      } else {
        navigate('/membership/payment');
      }
    } catch (error) {
      setMessage('We could not complete registration right now.');
    } finally {
      setProcessing(false);
    }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Login failed.');
        return;
      }

      localStorage.setItem('authToken', data.token);
      navigate(resolvedPlan === 'free' ? '/membership/free/success' : '/membership/payment');
    } catch (error) {
      setMessage('We could not log you in right now.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>{isPremium ? 'Create Premium Account' : 'Create Free Account'} | Innovation X Lab</title>
      </Helmet>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_35px_rgba(14,165,233,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200">
            {isPremium ? <Crown size={16} /> : <ShieldCheck size={16} />} 
            {isPremium ? 'Premium Membership' : 'Free Membership'}
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">{isPremium ? 'Join the premium layer of the future' : 'Welcome to a calmer, smarter reading experience'}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">{isPremium ? 'Build a deeper connection with the technology stories shaping the world.' : 'Unlock thoughtful updates, editorial roundups, and the best of Innovation X Lab—free.'}</p>

          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 size={18} className="mt-0.5 text-cyan-300" />
                <span className="text-sm text-slate-300">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">{isPremium ? 'Premium' : 'Free'}</p>
                <p className="mt-2 text-xl font-semibold text-white">{isPremium ? `${billingCycle === 'annual' ? 'Annual from $20' : 'Monthly from $2'}` : 'Always free'}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">Verified experience</div>
            </div>
            {isPremium ? (
              <div className="mt-5 flex rounded-full border border-white/10 bg-white/5 p-1">
                <button type="button" onClick={() => { setBillingCycle('monthly'); persistSelection('monthly'); }} className={`flex-1 rounded-full px-3 py-2 text-sm ${billingCycle === 'monthly' ? 'bg-cyan-500/10 text-cyan-200' : 'text-slate-300'}`}>Monthly</button>
                <button type="button" onClick={() => { setBillingCycle('annual'); persistSelection('annual'); }} className={`flex-1 rounded-full px-3 py-2 text-sm ${billingCycle === 'annual' ? 'bg-violet-500/10 text-violet-200' : 'text-slate-300'}`}>Annual</button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_35px_rgba(14,165,233,0.08)]">
          <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 p-1">
            <div className="flex flex-1 gap-2">
              <button type="button" onClick={() => setMode('register')} className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === 'register' ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'text-slate-300'}`}>{isPremium ? 'Create Premium Account' : 'Create Free Account'}</button>
              <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-2 text-sm ${mode === 'login' ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'text-slate-300'}`}>Login</button>
            </div>
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-cyan-400/20 bg-cyan-500/10 p-4">
            <div className="flex items-center justify-between text-sm text-slate-100">
              <span className="font-semibold">Step 1</span>
              <span>Choose Plan ✓</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-300">
              <div className="h-2 flex-1 rounded-full bg-white/10">
                <div className="h-2 w-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600" />
              </div>
              <span>{mode === 'register' ? 'Step 2 Create Account (Current)' : 'Step 2 Login'}</span>
            </div>
          </div>

          {message ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{message}</div> : null}

          {mode === 'register' ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Full Name" />
                <input value={username} onChange={(event) => setUsername(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Username (optional)" />
              </div>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Email Address" />
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Password" />
                <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Confirm Password" />
              </div>
              <select value={country} onChange={(event) => setCountry(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="India">India</option>
                <option value="Germany">Germany</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900" />
                <span>I accept the terms and privacy policy for my account.</span>
              </label>
              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <input type="checkbox" checked={subscribeNewsletter} onChange={(event) => setSubscribeNewsletter(event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-900" />
                <span>Subscribe me to the weekly newsletter and product updates.</span>
              </label>
              <button type="submit" disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white">
                {processing ? <><LoaderCircle size={16} className="animate-spin" /> Creating account...</> : 'Create Free Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Email Address" />
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Password" />
              <button type="submit" disabled={processing} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white">
                {processing ? <><LoaderCircle size={16} className="animate-spin" /> Signing in...</> : 'Login'}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center text-sm text-slate-400">
            {mode === 'register' ? <button type="button" onClick={() => setMode('login')} className="text-cyan-300">Already have an account? Login</button> : <button type="button" onClick={() => setMode('register')} className="text-cyan-300">Need a new account? Register</button>}
          </div>

          <div className="mt-8 flex items-center justify-between text-sm text-slate-400">
            <Link to="/membership" className="transition hover:text-cyan-300">Back to plans</Link>
            <span>Protected by modern security</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MembershipRegisterPage;
