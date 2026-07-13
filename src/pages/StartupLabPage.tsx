import { Helmet } from 'react-helmet-async';

const StartupLabPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Startup Lab | Innovation X Lab</title>
        <meta name="description" content="Read startup stories, founder interviews, and emerging company analysis." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Startup Lab</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Disruptive startups, bold ideas, and the people behind them</h1>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {['Startup stories', 'Founder interviews', 'Emerging companies', 'Business analysis'].map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">{item}</h3>
            <p className="mt-3 text-sm text-slate-400">A curated view of what is new, what is working, and what is shaping industries.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StartupLabPage;
