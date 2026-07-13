import { Helmet } from 'react-helmet-async';

const AdminPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Admin | Innovation X Lab</title>
        <meta name="description" content="Administrative dashboard structure for managing articles, uploads, categories, and subscribers." />
      </Helmet>
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Admin Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Future-ready content operations</h1>
        <p className="mt-6 text-lg text-slate-300">This space is prepared for article creation, editing, image uploads, subscriber management, and category administration.</p>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {['Create articles', 'Edit articles', 'Upload images', 'Manage categories', 'Manage subscribers'].map((item) => (
          <div key={item} className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-6">
            <h3 className="text-xl font-semibold text-white">{item}</h3>
            <p className="mt-3 text-sm text-slate-400">A scalable administrative surface ready for the next stage of platform growth.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
