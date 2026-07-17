import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

type PaymentMethod = {
  name: string;
  label: string;
};

const methods: PaymentMethod[] = [
  { name: 'stripe', label: 'Stripe' },
  { name: 'paypal', label: 'PayPal' },
  { name: 'paystack', label: 'Paystack' },
  { name: 'yoco', label: 'Yoco' },
  { name: 'peach', label: 'Peach Payments' },
  { name: 'ozow', label: 'Ozow' },
  { name: 'googlepay', label: 'Google Pay' },
  { name: 'applepay', label: 'Apple Pay' },
  { name: 'card', label: 'Credit Card' },
  { name: 'debit', label: 'Debit Card' },
];

const getStoredSelection = (): { plan: 'free' | 'premium'; billingCycle: 'monthly' | 'annual' } => {
  if (typeof window === 'undefined') {
    return { plan: 'premium', billingCycle: 'monthly' };
  }

  try {
    const savedSelection = window.localStorage.getItem('membershipSelection');
    if (!savedSelection) {
      return { plan: 'premium', billingCycle: 'monthly' };
    }

    const parsedSelection = JSON.parse(savedSelection);
    const plan = parsedSelection.plan === 'free' ? 'free' : 'premium';
    const billingCycle = parsedSelection.billingCycle === 'annual' ? 'annual' : 'monthly';
    return { plan, billingCycle };
  } catch (error) {
    console.error('Unable to restore payment selection', error);
    return { plan: 'premium', billingCycle: 'monthly' };
  }
};

const MembershipPaymentPage = () => {
  const navigate = useNavigate();
  const initialSelection = getStoredSelection();
  const [plan, setPlan] = useState<'free' | 'premium'>(initialSelection.plan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(initialSelection.billingCycle);
  const [selectedMethod, setSelectedMethod] = useState('paypal');
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/membership/premium');
      return;
    }

    const fetchSummary = async () => {
      const response = await fetch(buildApiUrl('/api/subscriptions/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setPlan(data.user?.membershipPlan === 'premium' ? 'premium' : 'free');
        setBillingCycle(data.user?.billingCycle === 'annual' ? 'annual' : 'monthly');
      }
    };

    fetchSummary();
  }, [navigate]);

  const total = useMemo(() => (billingCycle === 'annual' ? 20 : 2), [billingCycle]);

  const persistSelection = (nextBillingCycle: 'monthly' | 'annual') => {
    window.localStorage.setItem('membershipSelection', JSON.stringify({ plan, billingCycle: nextBillingCycle }));
  };

  const handlePayment = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMessage('Please sign in to continue.');
      return;
    }

    setProcessing(true);
    setMessage('');

    try {
      const response = await fetch(buildApiUrl('/api/subscriptions/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: 'premium', billingCycle, provider: selectedMethod === 'paypal' ? 'PayPal' : 'Stripe' }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Payment could not be started.');
        return;
      }

      if (data.approvalUrl) {
        window.location.assign(data.approvalUrl);
        return;
      }

      navigate('/dashboard');
    } catch (error) {
      setMessage('We could not start the payment flow.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <Helmet>
        <title>Membership Payment | Innovation X Lab</title>
      </Helmet>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_35px_rgba(14,165,233,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-200">
            <ShieldCheck size={16} /> Secure checkout
          </div>
          <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">Complete your membership</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">Choose your preferred payment method and unlock premium access instantly.</p>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Selected plan</p>
                <p className="mt-2 text-2xl font-semibold text-white">{plan === 'premium' ? 'Premium' : 'Free'}</p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">{billingCycle === 'annual' ? 'Annual' : 'Monthly'}</div>
            </div>
            <div className="mt-5 flex rounded-full border border-white/10 bg-white/5 p-1">
              <button type="button" aria-pressed={billingCycle === 'monthly'} onClick={() => { setBillingCycle('monthly'); persistSelection('monthly'); }} className={`flex-1 rounded-full px-3 py-2 text-sm transition-all ${billingCycle === 'monthly' ? 'bg-cyan-500/10 text-cyan-200' : 'text-slate-300'}`}>Monthly</button>
              <button type="button" aria-pressed={billingCycle === 'annual'} onClick={() => { setBillingCycle('annual'); persistSelection('annual'); }} className={`flex-1 rounded-full px-3 py-2 text-sm transition-all ${billingCycle === 'annual' ? 'bg-violet-500/10 text-violet-200' : 'text-slate-300'}`}>Annual</button>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-300"><span>Plan price</span><span>${total}</span></div>
              <div className="flex items-center justify-between text-sm text-slate-300"><span>Processing</span><span>Secure</span></div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {methods.map((method) => {
              const isSelected = selectedMethod === method.name;
              return (
                <button key={method.name} type="button" aria-pressed={isSelected} onClick={() => setSelectedMethod(method.name)} className={`rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${isSelected ? 'border-cyan-400/40 bg-cyan-500/15 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.2)]' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {method.name === 'paypal' ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700">
                          PP
                        </span>
                      ) : null}
                      <span className="font-medium">{method.label}</span>
                    </div>
                    {isSelected ? <CheckCircle2 size={16} className="text-cyan-300" /> : null}
                  </div>
                  {method.name === 'paypal' ? <span className="mt-2 block text-[11px] uppercase tracking-[0.24em] text-cyan-300">Fast secure wallet</span> : null}
                </button>
              );
            })}
          </div>

          {selectedMethod === 'paypal' ? (
            <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5 text-cyan-300" />
                <div>
                  <p className="font-semibold text-white">✓ PayPal Selected</p>
                  <p className="mt-1 text-cyan-100/90">You will securely complete your payment using your PayPal account.</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8 shadow-[0_0_35px_rgba(14,165,233,0.08)]">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300"><CreditCard size={18} /></div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Order summary</p>
              <h2 className="text-2xl font-semibold text-white">Your premium experience</h2>
            </div>
          </div>

          <div className="mt-8 space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between text-sm text-slate-300"><span>Innovation X Premium</span><span>${total}</span></div>
            <div className="flex items-center justify-between text-sm text-slate-300"><span>Billing cycle</span><span>{billingCycle === 'annual' ? 'Annual' : 'Monthly'}</span></div>
            <div className="flex items-center justify-between text-sm text-slate-300"><span>Payment method</span><span>{methods.find((entry) => entry.name === selectedMethod)?.label || 'PayPal'}</span></div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-base font-semibold text-white"><span>Total today</span><span>${total}</span></div>
            </div>
          </div>

          {message ? <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{message}</div> : null}

          <button onClick={handlePayment} disabled={processing} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white">
            {processing ? 'Preparing checkout...' : `Pay $${total} securely`} <ArrowRight size={15} />
          </button>

          <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle2 size={16} className="text-cyan-300" />
            <span>Instant premium access after successful payment</span>
          </div>
          <div className="mt-8 flex items-center justify-between text-sm text-slate-400">
            <Link to="/membership/premium" className="transition hover:text-cyan-300">Back to premium setup</Link>
            <span>Powered by secure providers</span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MembershipPaymentPage;
