import { Helmet } from 'react-helmet-async';

const SoftwareLabPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Software Lab | Innovation X Lab</title>
        <meta name="description" content="Review SaaS platforms, productivity tools, and developer software with clarity and depth." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Software Lab</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Software for ambitious teams and builders</h1>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {['SaaS reviews', 'Productivity tools', 'Developer tools', 'Workflow analysis'].map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">{item}</h3>
            <p className="mt-3 text-sm text-slate-400">Editorial comparisons that help teams choose tools with confidence and long-term value.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoftwareLabPage;
