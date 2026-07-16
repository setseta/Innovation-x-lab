import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Globe2, Megaphone, Rocket, Sparkles } from 'lucide-react';
import { buildApiUrl } from '../config/api';

type AdvertisingFormState = {
  companyName: string;
  businessName: string;
  website: string;
  industry: string;
  email: string;
  phone: string;
  country: string;
  objective: string;
  advertisementType: string;
  campaignTitle: string;
  campaignDescription: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  budget: string;
  additionalNotes: string;
  consent: boolean;
};

const initialFormState: AdvertisingFormState = {
  companyName: '',
  businessName: '',
  website: '',
  industry: '',
  email: '',
  phone: '',
  country: '',
  objective: 'Brand Awareness',
  advertisementType: 'Homepage Banner',
  campaignTitle: '',
  campaignDescription: '',
  targetAudience: '',
  startDate: '',
  endDate: '',
  budget: '$1,000+',
  additionalNotes: '',
  consent: false,
};

const benefits = [
  {
    title: 'Global Technology Audience',
    description: 'Reach readers interested in AI, software, gadgets, startups, coding and innovation.',
    icon: Globe2,
  },
  {
    title: 'Premium Brand Exposure',
    description: 'Showcase your business alongside trusted technology journalism.',
    icon: Sparkles,
  },
  {
    title: 'Flexible Campaigns',
    description: 'Run campaigns for a day, week, month or custom duration.',
    icon: Megaphone,
  },
  {
    title: 'Multiple Ad Placements',
    description: 'Homepage • Article pages • Sidebar • Newsletter sponsorship • Featured partner section',
    icon: Rocket,
  },
];

const AdvertisePage = () => {
  const [form, setForm] = useState<AdvertisingFormState>(initialFormState);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const benefitCards = useMemo(() => benefits, []);

  const handleFieldChange = (field: keyof AdvertisingFormState, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingMedia(true);
    const uploadData = new FormData();
    uploadData.append('mediaFile', file);

    try {
      const response = await fetch(buildApiUrl('/api/upload-advertising-media'), {
        method: 'POST',
        body: uploadData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Media upload failed');
      }

      setMediaUrl(data.url || '');
      setStatusMessage('Banner uploaded successfully.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Media upload failed.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('');

    if (!form.consent) {
      setStatusMessage('Please confirm that you agree to be contacted before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl('/api/advertising-requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          mediaFile: mediaUrl,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit your advertising request.');
      }

      setStatusMessage('Your advertising request has been received. Our team will contact you shortly.');
      setForm(initialFormState);
      setMediaUrl('');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to submit your advertising request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Advertise With Us | Innovation X Lab</title>
        <meta name="description" content="Advertise with Innovation X Lab and reach a global audience of technology enthusiasts, founders, and decision-makers." />
      </Helmet>

      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Advertise</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Advertise With Innovation X Lab</h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">Reach a global audience of technology enthusiasts, developers, entrepreneurs, business leaders, startups, and decision-makers through Innovation X Lab.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#advertising-request-form" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white shadow-glow">
              Start Your Campaign
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_12px_45px_rgba(9,13,26,0.55)] backdrop-blur-xl"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-cyan-400/20 bg-cyan-500/10 p-4">
              <div className="text-sm text-cyan-200">Audience</div>
              <div className="mt-2 text-3xl font-semibold text-white">Global</div>
            </div>
            <div className="rounded-[1.25rem] border border-violet-400/20 bg-violet-500/10 p-4">
              <div className="text-sm text-violet-200">Placements</div>
              <div className="mt-2 text-3xl font-semibold text-white">5+</div>
            </div>
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4 sm:col-span-2">
              <div className="text-sm text-slate-400">Trusted by growth-minded brands</div>
              <div className="mt-2 text-lg font-semibold text-white">Premium editorial reach for tech-first campaigns</div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mt-16">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Why advertise with us</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Built for ambitious brands in technology</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefitCards.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.title}
                whileHover={{ y: -4 }}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              >
                <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="advertising-request-form" className="mt-16 rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Advertising request</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Tell us about your campaign</h2>
          <p className="mt-4 text-slate-300">Share your goals, preferred placements, and timeline. Our team will respond with the next steps and custom positioning options.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
          <input value={form.companyName} onChange={(event) => handleFieldChange('companyName', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Company / Individual Name" required />
          <input value={form.businessName} onChange={(event) => handleFieldChange('businessName', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Business Name" required />
          <input value={form.website} onChange={(event) => handleFieldChange('website', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Website (optional)" />
          <input value={form.industry} onChange={(event) => handleFieldChange('industry', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Industry" required />
          <input type="email" value={form.email} onChange={(event) => handleFieldChange('email', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Email Address" required />
          <input value={form.phone} onChange={(event) => handleFieldChange('phone', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Phone Number (optional)" />
          <input value={form.country} onChange={(event) => handleFieldChange('country', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Country" required />

          <select value={form.objective} onChange={(event) => handleFieldChange('objective', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
            <option>Brand Awareness</option>
            <option>Product Launch</option>
            <option>Service Promotion</option>
            <option>Website Traffic</option>
            <option>Event Promotion</option>
            <option>Other</option>
          </select>

          <select value={form.advertisementType} onChange={(event) => handleFieldChange('advertisementType', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
            <option>Homepage Banner</option>
            <option>Sidebar Advertisement</option>
            <option>Sponsored Article</option>
            <option>Newsletter Sponsorship</option>
            <option>Featured Company</option>
            <option>Video Advertisement</option>
            <option>Custom Campaign</option>
          </select>

          <input value={form.campaignTitle} onChange={(event) => handleFieldChange('campaignTitle', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Campaign Title" required />
          <textarea value={form.campaignDescription} onChange={(event) => handleFieldChange('campaignDescription', event.target.value)} className="min-h-24 w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none md:col-span-2" placeholder="Campaign Description" required />
          <input value={form.targetAudience} onChange={(event) => handleFieldChange('targetAudience', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" placeholder="Target Audience" required />
          <input type="date" value={form.startDate} onChange={(event) => handleFieldChange('startDate', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" required />
          <input type="date" value={form.endDate} onChange={(event) => handleFieldChange('endDate', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" required />

          <select value={form.budget} onChange={(event) => handleFieldChange('budget', event.target.value)} className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
            <option>Under $100</option>
            <option>$100 - $500</option>
            <option>$500 - $1,000</option>
            <option>$1,000+</option>
          </select>

          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-white/10 bg-white/5 p-4 md:col-span-2">
            <label className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 transition hover:bg-white/10">
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
              {uploadingMedia ? 'Uploading media…' : 'Upload Banner or Media (optional)'}
            </label>
            {mediaUrl ? <p className="text-sm text-cyan-300">Media attached: {mediaUrl}</p> : null}
          </div>

          <textarea value={form.additionalNotes} onChange={(event) => handleFieldChange('additionalNotes', event.target.value)} className="min-h-28 w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none md:col-span-2" placeholder="Additional Notes" />

          <label className="flex items-center gap-3 text-sm text-slate-300 md:col-span-2">
            <input type="checkbox" checked={form.consent} onChange={(event) => handleFieldChange('consent', event.target.checked)} />
            I agree to be contacted regarding this advertising request.
          </label>

          <div className="md:col-span-2">
            <button type="submit" disabled={isSubmitting} className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? 'Submitting…' : 'Submit Advertising Request'}
            </button>
          </div>

          {statusMessage ? <p className="md:col-span-2 text-sm text-cyan-300">{statusMessage}</p> : null}
        </form>
      </section>
    </div>
  );
};

export default AdvertisePage;
