import { Helmet } from 'react-helmet-async';

const GadgetLabPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Gadget Lab | Innovation X Lab</title>
        <meta name="description" content="Read reviews and comparisons of flagship smartphones, laptops, and smart devices." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Gadget Lab</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Devices that blend design, performance, and intelligence</h1>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {['Smartphone reviews', 'Laptop deep dives', 'Hardware comparisons', 'Buying guides'].map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">{item}</h3>
            <p className="mt-3 text-sm text-slate-400">Hands-on testing and expert recommendations built for thoughtful purchasing decisions.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GadgetLabPage;
