function PlaceholderPage({ title, description }) {
  return (
    <main className="ml-64 min-h-screen p-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-100 bg-white p-12 shadow-sm">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-600">Phase 2</span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
      </div>
    </main>
  );
}

export default PlaceholderPage;
