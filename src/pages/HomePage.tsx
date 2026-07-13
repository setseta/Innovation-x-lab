import { motion } from 'framer-motion';
import { ArrowRight, Bot, Cpu, Orbit, Rocket, Sparkles, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { featuredStories, trendingArticles } from '../data/content';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'AI', 'Gadgets', 'Software', 'Coding', 'Startups', 'Reviews'];

  const experiments = [
    {
      title: 'AI Agents',
      description: 'Experiments with autonomous AI systems and intelligent workflows.',
      status: 'LIVE EXPERIMENT',
      icon: Bot,
      accent: 'from-cyan-500/25 to-cyan-500/5',
    },
    {
      title: 'Quantum Computing',
      description: 'Exploring next-generation computing possibilities with new architectures.',
      status: 'IN DEVELOPMENT',
      icon: Cpu,
      accent: 'from-violet-500/25 to-violet-500/5',
    },
    {
      title: 'Future Interfaces',
      description: 'Research into human-computer interaction and ambient computing.',
      status: 'COMING SOON',
      icon: Orbit,
      accent: 'from-fuchsia-500/25 to-fuchsia-500/5',
    },
    {
      title: 'Robotics',
      description: 'Testing automation and intelligent machines in real environments.',
      status: 'LIVE EXPERIMENT',
      icon: Rocket,
      accent: 'from-emerald-500/25 to-emerald-500/5',
    },
  ];

  const filteredStories = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return featuredStories.filter((story) => {
      const matchesCategory = activeCategory === 'All' || story.category === activeCategory;
      const matchesSearch = !term || story.title.toLowerCase().includes(term) || story.description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <div>
      <Helmet>
        <title>Innovation X Lab | Future Technology Media</title>
        <meta name="description" content="Explore AI, gadgets, software, coding, and startup innovation at Innovation X Lab." />
      </Helmet>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.2),transparent_26%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:34px_34px]" />
        <div className="absolute left-10 top-20 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-16 right-12 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
              <Sparkles size={16} />
              Premium technology intelligence
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-7xl">
              Exploring The Technologies That Shape Tomorrow
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
              Discover AI breakthroughs, innovative gadgets, software, coding insights, and startups changing the world.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/review" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white shadow-[0_0_35px_rgba(34,211,238,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(34,211,238,0.28)]">
                Explore Technology <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-slate-100 transition duration-300 hover:bg-white/10">
                Join Newsletter
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-400">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Global partnerships</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Emerging tech coverage</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">Founder-led insights</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/25 via-violet-500/10 to-transparent blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_0_50px_rgba(14,165,233,0.12)]">
              <div className="rounded-[1.4rem] border border-cyan-400/20 bg-[#060b1b] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm text-cyan-300">Innovation X Lab Experiments</span>
                  <span className="text-sm text-slate-400">Future Interface</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Cpu className="mb-3 text-cyan-400" size={24} />
                    <h3 className="font-semibold text-white">Neural Systems</h3>
                    <p className="mt-2 text-sm text-slate-400">AI orchestration and autonomous research loops.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Zap className="mb-3 text-violet-400" size={24} />
                    <h3 className="font-semibold text-white">Quantum Hardware</h3>
                    <p className="mt-2 text-sm text-slate-400">Hardware breakthroughs for next-generation experiences.</p>
                  </div>
                </div>
                <div className="mt-6 h-40 rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_45%),linear-gradient(135deg,rgba(15,23,42,1),rgba(2,6,23,1))] p-4">
                  <div className="flex h-full items-end justify-between gap-3">
                    {[78, 118, 96, 140, 108].map((height, index) => (
                      <div key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-500 to-violet-600" style={{ height: `${height}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Featured Technology Stories</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Across the Labs</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 outline-none" placeholder="Search stories" />
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button key={category} onClick={() => setActiveCategory(category)} className={`rounded-full px-3 py-2 text-sm ${activeCategory === category ? 'bg-cyan-500 text-white' : 'border border-white/10 bg-white/5 text-slate-300'}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStories.map((story) => (
            <Link key={story.slug} to={`/articles/${story.slug}`} className="group block">
              <motion.article whileHover={{ y: -6, scale: 1.01 }} className="group relative h-full overflow-hidden rounded-[1.65rem] border border-white/10 bg-slate-900/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition-all duration-300 hover:border-cyan-400/40 hover:shadow-[0_0_35px_rgba(34,211,238,0.14)]">
                <div className="overflow-hidden">
                  <img src={story.image} alt={story.title} className="h-48 w-full object-cover transition duration-500 group-hover:scale-110" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">{story.category}</span>
                    <span className="text-sm text-slate-500">{story.readingTime}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{story.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{story.description}</p>
                  <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
                    <span>{story.author}</span>
                    <span className="inline-flex items-center gap-2 text-cyan-300">Read story <ArrowRight size={14} /></span>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
        {filteredStories.length === 0 && <p className="mt-6 text-sm text-slate-400">No stories match that search yet. Try a different term or category.</p>}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Innovation X Lab Experiments</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Research that feels like the next decade</h2>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          {experiments.map((experiment, index) => {
            const Icon = experiment.icon;
            return (
              <motion.div key={experiment.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.35, delay: index * 0.06 }} className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/80 p-6 shadow-[0_0_40px_rgba(15,23,42,0.4)] hover:-translate-y-1 hover:border-cyan-400/40">
                <div className={`absolute inset-0 bg-gradient-to-br ${experiment.accent}`} />
                <div className="relative">
                  <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/10 p-3 text-cyan-300">
                    <Icon size={22} />
                  </div>
                  <div className="text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-cyan-300">{experiment.status}</div>
                  <h3 className="mt-3 text-xl font-semibold text-white">{experiment.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{experiment.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">Trending Now</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">What the future is talking about</h2>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {trendingArticles.map((article) => (
            <Link key={article.slug} to={`/articles/${article.slug}`} className="group block">
              <div className="h-full rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_35px_rgba(34,211,238,0.14)]">
                <img src={article.image} alt={article.title} className="mb-5 h-40 w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105" />
                <div className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">{article.category}</div>
                <h3 className="mt-3 text-xl font-semibold text-white">{article.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{article.description}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                  <span>{article.readingTime}</span>
                  <span className="text-cyan-300">Read more</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Innovation Showcase</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">A glimpse into the next decade of invention</h2>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">From immersive AI interfaces to autonomous hardware and productivity platforms, our coverage highlights the technologies turning bold ideas into reality.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
              <ul className="space-y-4">
                <li className="flex items-start gap-3"><span className="mt-1 text-cyan-400">•</span><span>Emerging AI experiences that feel conversational, adaptive, and intelligent.</span></li>
                <li className="flex items-start gap-3"><span className="mt-1 text-cyan-400">•</span><span>Next-gen gadget reviews grounded in real-world testing and performance data.</span></li>
                <li className="flex items-start gap-3"><span className="mt-1 text-cyan-400">•</span><span>Developer tools, startup stories, and software ecosystems ready for scale.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
        <div className="rounded-[2rem] border border-white/10 bg-[#070d1d] p-8 lg:p-12">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Newsletter</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Stay Ahead Of The Future</h2>
            <p className="mt-4 text-lg text-slate-300">Join innovators, founders, and technology enthusiasts receiving thoughtful analysis each week.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" placeholder="Enter your email" />
            <button className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 font-semibold text-white">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
