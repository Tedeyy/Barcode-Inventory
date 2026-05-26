import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

import { Sidebar } from './Sidebar';

export const Layout = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--bg-navy)' }} />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
