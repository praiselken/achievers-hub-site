import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-20"
         style={{ background: '#F8F5FD' }}>
      <div className="text-center max-w-md">
        <p className="font-mono font-bold text-8xl mb-4" style={{ color: 'var(--purple-light)' }}>404</p>
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Page not found</h1>
        <p className="font-body text-sm text-gray-500 mb-8">
          That page doesn't exist or has moved. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-glow-purple text-sm no-underline px-5 py-2.5" style={{ borderRadius: '12px' }}>
            Go home
          </Link>
          <Link to="/dashboard" className="font-body text-sm font-semibold px-5 py-2.5 rounded-xl no-underline transition-all"
                style={{ background: 'white', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }}>
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
