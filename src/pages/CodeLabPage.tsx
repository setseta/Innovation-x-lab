import { Helmet } from 'react-helmet-async';

const CodeLabPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Code Lab | Innovation X Lab</title>
        <meta name="description" content="Learn modern development, explore tutorials, open source, and career-focused resources." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Code Lab</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Practical coding knowledge for modern builders</h1>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {['Programming tutorials', 'Full-stack development', 'Open-source projects', 'Developer resources'].map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">{item}</h3>
            <p className="mt-3 text-sm text-slate-400">Clear walkthroughs and curated references designed for professionals and ambitious learners.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeLabPage;
