import { Helmet } from 'react-helmet-async';

const ContactPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Contact | Innovation X Lab</title>
        <meta name="description" content="Contact Innovation X Lab for partnerships, feedback, or editorial inquiries." />
      </Helmet>
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Contact</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Let’s build the future together</h1>
          <p className="mt-6 text-lg text-slate-300">Whether you are a founder, partner, creator, or curious reader, we would love to hear from you.</p>
          <div className="mt-8 space-y-3 text-slate-400">
            <p>hello@innovationxlab.com</p>
            <p>Gobal</p>
          </div>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
          <form className="space-y-4">
            <input className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Your name" />
            <input className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Email address" />
            <textarea className="h-32 w-full rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Tell us about your idea or inquiry" />
            <button className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
