import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/log', label: 'Log Trade', icon: '➕' },
  { to: '/trades', label: 'Trades', icon: '📋' },
  { to: '/setups', label: 'Setups', icon: '🧩' },
];

export default function Layout() {
  const { lock } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-elev)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}
        >
          <span style={{ fontWeight: 700, fontSize: 16 }}>Nifty ICT Journal</span>
          <nav style={{ display: 'none' }} className="desktop-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button className="ghost" onClick={lock} style={{ minHeight: 36, padding: '6px 12px' }}>
            Lock
          </button>
        </div>
        <nav className="desktop-nav-row container" style={{ display: 'flex', gap: 4, paddingBottom: 8 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main style={{ flex: 1, paddingBottom: 76 }}>
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `bottom-nav-link${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
