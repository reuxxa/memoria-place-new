'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Membaca sesi aktif
    const session = localStorage.getItem('kw_session');
    const token = localStorage.getItem('kw_token');
    
    if (session && token) {
      setUser(JSON.parse(session));
      fetchStats(token);
    } else {
      setLoading(false);
    }

    const handleAuthChange = () => {
      const activeSession = localStorage.getItem('kw_session');
      const activeToken = localStorage.getItem('kw_token');
      if (activeSession && activeToken) {
        setUser(JSON.parse(activeSession));
        fetchStats(activeToken);
      } else {
        setUser(null);
        setStats([]);
        setLoading(false);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const fetchStats = async (token) => {
    try {
      setLoading(true);
      const res = await fetch('/api/angkatan/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const payload = await res.json();
      
      if (res.status === 401) {
        // Token kedaluwarsa
        localStorage.removeItem('kw_token');
        localStorage.removeItem('kw_session');
        window.dispatchEvent(new Event('auth-change'));
        return;
      }

      if (payload.status === 'success') {
        setStats(payload.data || []);
      } else {
        setError(payload.message || 'Gagal memuat statistik angkatan');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const handleCtaClick = () => {
    if (user) {
      router.push(`/tulis?angkatan=${user.angkatan}`);
    } else {
      router.push('/auth?mode=login&alert=unauthorized');
    }
  };

  const goToRoom = (angkatan) => {
    router.push(`/kamar/${angkatan}`);
  };

  const icons = [
    'bi-mortarboard-fill',
    'bi-rocket-takeoff-fill',
    'bi-lightning-charge-fill',
    'bi-stars',
    'bi-balloon-fill',
    'bi-award-fill'
  ];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <header className="hero-section text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center">
            <span className="badge bg-yellow-400 text-slate-900 px-3 py-1.5 rounded-full fw-bold text-xs md:text-sm font-bold tracking-wider mb-4 animate-fade-in">
              DIGITAL MEMORY ARCHIVE
            </span>
            <h1 className="hero-title animate-fade-in text-4xl md:text-6xl font-extrabold text-white">
              Jejak Digital. <br />
              <span className="text-yellow-400">Kenangan Abadi.</span>
            </h1>
            <p className="hero-desc mt-4 text-slate-200 font-light max-w-2xl text-base md:text-lg animate-fade-in">
              Abadikan momen berharga, harapan masa depan, serta keluh kesah masa sekolah bersama kawan seangkatanmu. 
              Pesanmu tersimpan rapi untuk selamanya.
            </p>
            <button
              onClick={handleCtaClick}
              className="btn-gold mt-6 btn-lg py-3 px-6 shadow-lg text-lg flex items-center gap-2 animate-fade-in"
            >
              <i className="bi bi-folder-symlink-fill"></i>
              Tulis Pesan dan Kesan
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Generations Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="section-title text-2xl md:text-3xl font-bold">
            Ruang Memori Angkatan
          </h2>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Pilih ruang angkatan untuk membaca arsip kenangan alumni.
          </p>
        </div>

        {/* Jika belum masuk */}
        {!user && (
          <div className="max-w-md mx-auto text-center p-8 bg-white border border-slate-100 rounded-2xl shadow-sm my-6 animate-fade-in">
            <i className="bi bi-shield-lock-fill text-yellow-500 text-4xl mb-3 block"></i>
            <h4 className="text-lg font-bold text-slate-800">Akses Terkunci</h4>
            <p className="text-slate-500 text-sm mt-2 mb-4">
              Anda harus masuk terlebih dahulu menggunakan akun alumni untuk melihat ruang memori angkatan.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/auth?mode=login" className="btn-navy text-sm py-2 px-4 no-underline">
                Masuk Sekarang
              </Link>
              <Link href="/auth?mode=register" className="btn-gold text-sm py-2 px-4 no-underline">
                Daftar Baru
              </Link>
            </div>
          </div>
        )}

        {/* Jika sudah masuk */}
        {user && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mb-3"></div>
                <p className="text-sm font-semibold">Mengambil data ruang memori angkatan...</p>
              </div>
            ) : error ? (
              <div className="max-w-md mx-auto text-center p-6 bg-red-50 border border-red-100 rounded-xl my-6">
                <i className="bi bi-exclamation-octagon text-red-500 text-3xl mb-2 block"></i>
                <p className="text-red-700 text-sm font-medium">{error}</p>
                <button 
                  onClick={() => fetchStats(localStorage.getItem('kw_token'))}
                  className="btn-navy text-xs py-1.5 px-3 mt-3"
                >
                  Coba Lagi
                </button>
              </div>
            ) : stats.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-lg mx-auto">
                <i className="bi bi-chat-dots-fill text-4xl mb-3 block text-slate-300"></i>
                <h5 className="font-bold">Belum Ada Angkatan</h5>
                <p className="text-sm mt-1">Belum ada angkatan atau pesan yang terdaftar. Jadilah alumni pertama yang mendaftar!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                {stats.map((stat, index) => {
                  const icon = icons[index % icons.length];
                  return (
                    <div
                      key={stat.angkatan}
                      onClick={() => goToRoom(stat.angkatan)}
                      className="angkatan-card animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="angkatan-icon">
                        <i className={`bi ${icon}`}></i>
                      </div>
                      <h3 className="angkatan-year">Angkatan {stat.angkatan}</h3>
                      <p className="angkatan-count">{stat.count} pesan tersimpan</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Quick API Link for Developers */}
      <section className="bg-slate-100 py-6 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          Developer Mode: Lihat dokumentasi API Swagger di{' '}
          <Link href="/docs" className="text-yellow-600 font-bold hover:underline">
            /docs
          </Link>
        </p>
      </section>
    </main>
  );
}
