'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Membaca sesi dari localStorage setelah komponen mounted (client-side)
    const session = localStorage.getItem('kw_session');
    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch (e) {
        localStorage.removeItem('kw_session');
      }
    }

    // Mendengarkan event custom login/logout untuk sinkronisasi state
    const handleAuthChange = () => {
      const activeSession = localStorage.getItem('kw_session');
      if (activeSession) {
        setUser(JSON.parse(activeSession));
      } else {
        setUser(null);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kw_token');
    localStorage.removeItem('kw_session');
    
    // Hapus cookies untuk server-side middleware
    document.cookie = "kw_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "kw_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    
    setUser(null);
    
    // Memicu event agar komponen lain tahu
    window.dispatchEvent(new Event('auth-change'));
    
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="navbar navbar-custom">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex justify-between items-center flex-wrap gap-4">
        <Link href="/" className="navbar-brand-custom no-underline">
          <i className="bi bi-box-seam-fill text-warning"></i>
          Memoria <span className="text-yellow-400">Place</span>
        </Link>
        <div id="navbar-auth-section" className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <span className="navbar-user-text text-sm md:text-base">
                Halo, <span className="text-yellow-400 font-semibold">{user.username}</span> (Angkatan {user.angkatan})
              </span>
              <button 
                onClick={handleLogout}
                className="btn-danger-custom text-sm py-1.5 px-3 rounded-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/auth?mode=login" className="btn-outline-gold text-sm py-1.5 px-3 no-underline">
                Masuk
              </Link>
              <Link href="/auth?mode=register" className="btn-gold text-sm py-1.5 px-3 no-underline">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
