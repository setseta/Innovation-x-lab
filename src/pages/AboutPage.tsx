import { Helmet } from 'react-helmet-async';

const AboutPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>About | Innovation X Lab</title>
        <meta name="description" content="Learn about Innovation X Lab and its mission to explore technology and innovation." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">About</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">A technology platform for curious minds and bold builders</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">Innovation X Lab is a technology platform dedicated to exploring innovation, artificial intelligence, software, hardware, and the future of technology. We combine editorial rigor with a premium visual experience to make complex subjects feel clear, timely, and relevant.</p>
      </div>
    </div>
  );
};

export default AboutPage;
