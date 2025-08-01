'use client';

export default function BrowserCompatibilityFallback() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Browser Compatibility Issue</h1>
        <p className="mb-4">For the best experience, please use a modern browser like Chrome, Firefox, Safari, or Edge.</p>
        <button 
          onClick={handleReload}
          className="px-6 py-3 bg-cyan-400 text-slate-900 rounded-lg hover:bg-cyan-300 transition-colors inline-block"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}