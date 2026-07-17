import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

const PaymentStatusPage = () => {
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Finishing your membership payment...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('token') || params.get('orderId') || '';
    const payerId = params.get('PayerID') || params.get('payerId') || '';
    const token = localStorage.getItem('authToken');

    if (location.pathname.includes('/payment/cancel')) {
      setStatus('error');
      setMessage('Your payment was cancelled. You can try again whenever you are ready.');
      return;
    }

    if (!orderId) {
      setStatus('error');
      setMessage('We could not verify the PayPal order that returned to us.');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Please sign in again to finish activating your premium membership.');
      return;
    }

    const completePayment = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/subscriptions/paypal/complete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId, payerId }),
        });

        const data = await response.json();
        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'We could not finish your payment verification.');
          return;
        }

        setStatus('success');
        setMessage(data.message || 'Your premium membership is now active.');
      } catch (error) {
        setStatus('error');
        setMessage('We could not verify your payment right now.');
      }
    };

    completePayment();
  }, [location.pathname, location.search]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <Helmet>
        <title>{status === 'success' ? 'Payment successful' : 'Payment status'} | Innovation X Lab</title>
      </Helmet>

      <div className="w-full rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-8 text-center shadow-[0_0_35px_rgba(14,165,233,0.08)]">
        <div className={`mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${status === 'success' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-cyan-500/15 text-cyan-300'}`}>
          {status === 'success' ? '✓' : 'i'}
        </div>
        <h1 className="text-3xl font-semibold text-white">{status === 'success' ? 'Payment completed' : 'Payment update'}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-300">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/membership" className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white">Return to membership</Link>
          <Link to="/" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200">Back to home</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
