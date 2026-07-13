import { Helmet } from 'react-helmet-async';
import { Star } from 'lucide-react';

const ReviewPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Review Lab | Innovation X Lab</title>
        <meta name="description" content="Read detailed product reviews, comparisons, ratings, and testing reports." />
      </Helmet>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Review Page</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Premium reviews built on testing, context, and clarity</h1>
          <p className="mt-5 text-lg text-slate-300">Detailed product reviews, comparisons, and testing reports designed to help readers choose with confidence.</p>

          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <div className="flex items-center gap-2 text-amber-400">
              {[...Array(5)].map((_, index) => (<Star key={index} size={18} fill="currentColor" />))}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-white">Aurora X1 Smart Display</h2>
            <p className="mt-3 text-slate-400">A premium intelligent display with exceptional performance, striking design, and thoughtful ecosystem integration.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-white">Pros</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li>• Fast and responsive interface</li>
                  <li>• Excellent display fidelity</li>
                  <li>• Strong ecosystem compatibility</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white">Cons</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li>• Premium pricing</li>
                  <li>• Short intro period for some apps</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6">
          <h3 className="text-xl font-semibold text-white">Specifications</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-400">
            <li><span className="text-white">Display:</span> 14-inch OLED, 120Hz</li>
            <li><span className="text-white">Battery:</span> 16 hours</li>
            <li><span className="text-white">Processor:</span> Neural 8-core chip</li>
            <li><span className="text-white">Connectivity:</span> Wi-Fi 7, Bluetooth 5.4</li>
          </ul>
          <h3 className="mt-8 text-xl font-semibold text-white">User Comments</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">“The deeper analysis and real-world testing make it feel like a genuinely premium review.”</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">“Balanced pros and cons make it easy to trust the verdict.”</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
