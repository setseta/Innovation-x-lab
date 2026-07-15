import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { buildApiUrl } from '../config/api';

const budgetOptions = ['Under $100', '$100 - $500', '$500 - $1,000', '$1,000+'];
const objectiveOptions = ['Brand Awareness', 'Product Launch', 'Service Promotion', 'Website Traffic', 'Event Promotion', 'Other'];
const adTypeOptions = ['Homepage Banner', 'Sidebar Advertisement', 'Sponsored Article', 'Newsletter Sponsorship', 'Featured Company', 'Video Advertisement', 'Custom Campaign'];

const AdvertisePage = () => {
  const [form, setForm] = useState({
    companyName: '',
    businessName: '',
    website: '',
    industry: '',
    email: '',
    phone: '',
    country: '',
    objective: '',
    advertisementType: '',
    campaignTitle: '',
    campaignDescription: '',
    targetAudience: '',
    startDate: '',
    endDate: '',
    budget: '',
    mediaFile: null as File | null,
    additionalNotes: '',
    agreeToContact: false,
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const benefitCards = useMemo(() => [
    {
      title: 'Global Technology Audience',
      copy: 'Reach readers interested in AI, software, gadgets, startups, coding and innovation.',
    },
    {
      title: 'Premium Brand Exposure',
      copy: 'Showcase your business alongside trusted technology journalism.',
    },
    {
      title: 'Flexible Campaigns',
      copy: 'Run campaigns for a day, week, month or custom duration.',
    },
    {
      title: 'Multiple Ad Placements',
      copy: 'Homepage, Article pages, Sidebar, Newsletter sponsorship, Featured partner section.',
    },
  ], []);

  const handleChange = (key: string, value: string | boolean | File | null) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.agreeToContact) {
      setStatus('Please agree to be contacted regarding this request.');
      return;
    }

    setIsSubmitting(true);
    setStatus('');
    const requestData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null) {
        requestData.append(key, value instanceof File ? value : String(value));
      }
    });

    try {
      const response = await fetch(buildApiUrl('/api/advertising-requests'), {
        method: 'POST',
        body: requestData,
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('Your advertising request has been submitted. Our team will contact you shortly.');
        setForm({
          companyName: '',
          businessName: '',
          website: '',
          industry: '',
          email: '',
          phone: '',
          country: '',
          objective: '',
          advertisementType: '',
          campaignTitle: '',
          campaignDescription: '',
          targetAudience: '',
          startDate: '',
          endDate: '',
          budget: '',
          mediaFile: null,
          additionalNotes: '',
          agreeToContact: false,
        });
      } else {
        setStatus(data.error || 'Unable to submit your advertising request.');
      }
    } catch (error) {
      setStatus('Unable to submit your advertising request. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Advertise With Innovation X Lab</title>
        <meta name="description" content="Reach technology professionals and innovators through premium advertising opportunities on Innovation X Lab." />
      </Helmet>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-10 shadow-[0_0_80px_rgba(8,16,43,0.4)] backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Advertise With Us</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold text-white sm:text-5xl">Advertise With Innovation X Lab</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Reach a global audience of technology enthusiasts, developers, entrepreneurs, business leaders, startups, and decision-makers through Innovation X Lab.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#advertising-request" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5">Start Your Campaign</a>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Premium placement for your brand in the world of deep tech.</span>
            </div>
          </div>
          <div className="grid gap-4">
            {benefitCards.map((card) => (
              <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7 shadow-xl shadow-slate-950/40 backdrop-blur-xl">
                <h2 className="text-xl font-semibold text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{card.copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_40px_rgba(14,30,62,0.35)] backdrop-blur-xl">
          <h2 className="text-3xl font-semibold text-white">Why Advertise With Us</h2>
          <p className="mt-4 text-slate-300">Innovation X Lab connects your brand with an audience that values intelligence, innovation, and premium technology coverage.</p>
          <div className="mt-8 space-y-4">
            {benefitCards.map((card) => (
              <div key={card.title} className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <div className="text-lg font-semibold text-white">{card.title}</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_40px_rgba(14,30,62,0.35)] backdrop-blur-xl">
          <h2 className="text-3xl font-semibold text-white">Advertising Request</h2>
          <p className="mt-3 text-slate-300">Submit your request and our team will follow up with a tailored campaign proposal.</p>
          <form id="advertising-request" onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.companyName} onChange={(event) => handleChange('companyName', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" placeholder="Company / Individual Name" required />
              <input value={form.businessName} onChange={(event) => handleChange('businessName', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" placeholder="Business Name" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.website} onChange={(event) => handleChange('website', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" placeholder="Website (optional)" />
              <input value={form.industry} onChange={(event) => handleChange('industry', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" placeholder="Industry" required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.email} onChange={(event) => handleChange('email', event.target.value)} type="email" className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" placeholder="Email Address" required />
              <input value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" placeholder="Phone Number (optional)" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.country} onChange={(event) => handleChange('country', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" placeholder="Country" required />
              <select value={form.objective} onChange={(event) => handleChange('objective', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" required>
                <option value="">Advertisement Objective</option>
                {objectiveOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <select value={form.advertisementType} onChange={(event) => handleChange('advertisementType', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" required>
                <option value="">Advertisement Type</option>
                {adTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <input value={form.campaignTitle} onChange={(event) => handleChange('campaignTitle', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" placeholder="Campaign Title" required />
            </div>

            <textarea value={form.campaignDescription} onChange={(event) => handleChange('campaignDescription', event.target.value)} className="min-h-[130px] w-full rounded-[1.5rem] border border-white/10 bg-slate-950/80 px-4 py-4 text-sm text-white outline-none" placeholder="Campaign Description" required />

            <textarea value={form.targetAudience} onChange={(event) => handleChange('targetAudience', event.target.value)} className="min-h-[100px] w-full rounded-[1.5rem] border border-white/10 bg-slate-950/80 px-4 py-4 text-sm text-white outline-none" placeholder="Target Audience" required />

            <div className="grid gap-4 md:grid-cols-3">
              <input value={form.startDate} onChange={(event) => handleChange('startDate', event.target.value)} type="date" className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" required />
              <input value={form.endDate} onChange={(event) => handleChange('endDate', event.target.value)} type="date" className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" required />
              <select value={form.budget} onChange={(event) => handleChange('budget', event.target.value)} className="rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" required>
                <option value="">Budget Range</option>
                {budgetOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4">
              <label className="block text-sm font-semibold text-white">Upload Banner or Media (optional)</label>
              <input type="file" accept="image/*,video/*" onChange={(event) => handleChange('mediaFile', event.target.files?.[0] || null)} className="mt-3 w-full rounded-full border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white outline-none" />
            </div>

            <textarea value={form.additionalNotes} onChange={(event) => handleChange('additionalNotes', event.target.value)} className="min-h-[100px] w-full rounded-[1.5rem] border border-white/10 bg-slate-950/80 px-4 py-4 text-sm text-white outline-none" placeholder="Additional Notes" />

            <label className="inline-flex items-center gap-3 text-sm text-slate-300">
              <input type="checkbox" checked={form.agreeToContact} onChange={(event) => handleChange('agreeToContact', event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-950/80 text-cyan-400 focus:ring-cyan-500" />
              I agree to be contacted regarding this advertising request.
            </label>

            {status ? <p className="text-sm text-cyan-300">{status}</p> : null}
            <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Advertising Request'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AdvertisePage;
