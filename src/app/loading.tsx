import LoadingSpinner from './components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-slate-400">Loading...</p>
      </div>
    </div>
  );
}