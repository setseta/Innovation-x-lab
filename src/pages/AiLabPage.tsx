import { Helmet } from 'react-helmet-async';

const AiLabPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>AI Lab | Innovation X Lab</title>
        <meta name="description" content="Explore AI news, tools, tutorials, experiments, and productivity solutions." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">AI Lab</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Artificial intelligence at the frontier</h1>
        <p className="mt-5 text-lg text-slate-300">From model benchmarks to practical workflows, this lab covers the tools and ideas shaping the next era of intelligence.</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {['AI news and breakthroughs', 'AI tool reviews', 'AI tutorials and experiments', 'AI productivity systems'].map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">{item}</h3>
            <p className="mt-3 text-sm text-slate-400">A premium editorial overview of how AI is moving from experimentation to everyday utility.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiLabPage;
