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

const MembershipPaymentPage = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<'free' | 'premium'>('premium');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
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
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm text-slate-300"><span>Plan price</span><span>${total}</span></div>
              <div className="flex items-center justify-between text-sm text-slate-300"><span>Processing</span><span>Secure</span></div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {methods.map((method) => (
              <button key={method.name} type="button" onClick={() => setSelectedMethod(method.name)} className={`rounded-2xl border px-4 py-3 text-left text-sm ${selectedMethod === method.name ? 'border-cyan-400/30 bg-cyan-500/10 text-white' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                {method.label}
              </button>
            ))}
          </div>
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
