'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const linkStyle = (path: string) => ({
    color: '#ffffff',
    fontSize: '15px',
    cursor: 'pointer',
    textDecoration: 'none',
    opacity: pathname === path ? 1 : 0.85,
    fontWeight: pathname === path ? '700' : '500',
    borderBottom: pathname === path ? '2px solid #ffffff' : '2px solid transparent',
    paddingBottom: '4px',
    transition: 'opacity 0.2s ease, border-bottom 0.2s ease',
  });

  return (
    <nav className="navbar" style={{ backgroundColor: '#172b4d', padding: '16px 32px' }}>
      <div
        className="nav-container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <Link
          href="/"
          className="nav-logo"
          style={{
            cursor: 'pointer',
            color: '#ffffff',
            fontSize: '20px',
            fontWeight: '700',
            textDecoration: 'none',
          }}
        >
          Job Application Tracker
        </Link>

        <div className="nav-links" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/" style={linkStyle('/')}>
            Dashboard
          </Link>

          <Link href="/applications" style={linkStyle('/applications')}>
            Applications
          </Link>

          <Link href="/applications/new" style={linkStyle('/applications/new')}>
            Add Application
          </Link>
        </div>
      </div>
    </nav>
  );
}