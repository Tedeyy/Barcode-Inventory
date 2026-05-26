import { NavLink } from 'react-router-dom';
import { Barcode, LayoutDashboard, List, Camera, PlusSquare, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { signOut, profile } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <List size={20} /> },
    { name: 'Scan', path: '/scanner', icon: <Camera size={20} /> },
    { name: 'Generate', path: '/generator', icon: <PlusSquare size={20} /> },
  ];

  return (
    <nav className="navbar-top">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div className="navbar-brand">
          <Barcode size={28} />
          <span style={{ fontSize: '1.25rem', fontWeight: '600', letterSpacing: '0.5px' }}>
            BarcodeSys
          </span>
        </div>

        <div className="navbar-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="navbar-actions">
        {profile && (
          <span className="desktop-only" style={{ fontSize: '0.875rem', color: 'var(--border-color)' }}>
            Welcome, {profile.username || 'User'}
          </span>
        )}
        <button 
          onClick={signOut}
          style={{ 
            background: 'transparent', 
            color: 'var(--text-inverse)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--text-secondary)',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-navy-light)';
            e.currentTarget.style.color = 'var(--accent-gold)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-inverse)';
          }}
        >
          <LogOut size={18} />
          <span className="desktop-only">Sign Out</span>
        </button>
      </div>
    </nav>
  );
};
