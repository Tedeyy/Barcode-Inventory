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
    <nav style={{ 
      backgroundColor: 'var(--bg-navy)', 
      color: 'var(--text-inverse)', 
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-gold)' }}>
          <Barcode size={28} />
          <span style={{ fontSize: '1.25rem', fontWeight: '600', letterSpacing: '0.5px' }}>
            BarcodeSys
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--accent-gold)' : 'var(--text-inverse)',
                backgroundColor: isActive ? 'var(--bg-navy-light)' : 'transparent',
                transition: 'all 0.2s',
                fontWeight: '500'
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {profile && (
          <span style={{ fontSize: '0.875rem', color: 'var(--border-color)' }}>
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
          Sign Out
        </button>
      </div>
    </nav>
  );
};
