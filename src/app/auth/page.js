'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [alert, setAlert] = useState(null); // { type: 'success' | 'danger' | 'warning', message: '' }
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register fields
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerAngkatan, setRegisterAngkatan] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Jika sudah login, alihkan langsung ke beranda
    const session = localStorage.getItem('kw_session');
    if (session) {
      router.push('/');
      return;
    }

    // Periksa parameter URL mode
    const mode = searchParams.get('mode');
    const alertType = searchParams.get('alert');

    if (mode === 'register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }

    if (alertType === 'unauthorized') {
      setAlert({
        type: 'danger',
        message: 'Silakan masuk terlebih dahulu untuk mengakses ruang memori!'
      });
    }
  }, [searchParams, router]);

  const switchTab = (tab) => {
    setAlert(null);
    setActiveTab(tab);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const username = loginUsername.trim();
    const password = loginPassword;

    if (!username || !password) {
      setAlert({ type: 'warning', message: 'Username dan Password harus diisi!' });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setAlert({ type: 'success', message: 'Login Berhasil! Mengalihkan ke beranda...' });
        
        // Simpan sesi
        localStorage.setItem('kw_token', data.token);
        localStorage.setItem('kw_session', JSON.stringify({
          username: data.user.username,
          angkatan: data.user.angkatan
        }));

        // Simpan cookie untuk Middleware server-side
        document.cookie = `kw_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        document.cookie = `kw_session=${encodeURIComponent(JSON.stringify({
          username: data.user.username,
          angkatan: data.user.angkatan
        }))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

        // Pemicu event auth-change untuk Navbar dan Home
        window.dispatchEvent(new Event('auth-change'));

        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } else {
        setAlert({ type: 'danger', message: data.message || 'Login gagal' });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: 'danger', message: 'Gagal terhubung ke server autentikasi' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const username = registerUsername.trim();
    const password = registerPassword;
    const angkatan = registerAngkatan;

    if (!username || !password || !angkatan) {
      setAlert({ type: 'warning', message: 'Semua kolom harus diisi!' });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, angkatan })
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setAlert({ type: 'success', message: 'Registrasi Berhasil! Mengalihkan ke beranda...' });

        // Simpan sesi
        localStorage.setItem('kw_token', data.token);
        localStorage.setItem('kw_session', JSON.stringify({
          username: data.user.username,
          angkatan: data.user.angkatan
        }));

        // Simpan cookie untuk Middleware server-side
        document.cookie = `kw_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        document.cookie = `kw_session=${encodeURIComponent(JSON.stringify({
          username: data.user.username,
          angkatan: data.user.angkatan
        }))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

        // Pemicu event auth-change
        window.dispatchEvent(new Event('auth-change'));

        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } else {
        setAlert({ type: 'danger', message: data.message || 'Registrasi gagal' });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: 'danger', message: 'Gagal menghubungkan registrasi ke server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper flex-1">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="auth-card w-full max-w-md my-8">
          {/* Header Banner */}
          <div className="auth-header">
            <i className="bi bi-shield-lock-fill text-yellow-400 text-4xl mb-2 d-block"></i>
            <h3 className="text-xl font-bold text-white mb-0">Autentikasi Pengguna</h3>
            <p className="text-slate-300 text-xs mt-1">Akses gerbang memoria angkatan</p>
          </div>

          {/* Card Body */}
          <div className="auth-body">
            {/* System Alert Banner */}
            {alert && (
              <div 
                className={`p-3 rounded-lg flex items-center mb-4 text-xs font-semibold ${
                  alert.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : alert.type === 'warning' 
                      ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                <i className={`bi mr-2 text-base ${
                  alert.type === 'success' 
                    ? 'bi-check-circle-fill text-green-500' 
                    : alert.type === 'warning' 
                      ? 'bi-exclamation-circle-fill text-yellow-500' 
                      : 'bi-x-circle-fill text-red-500'
                }`}></i>
                <div>{alert.message}</div>
              </div>
            )}

            {/* Switchable Tabs */}
            <div className="auth-tabs">
              <button 
                onClick={() => switchTab('login')} 
                className={`auth-tab-btn flex items-center justify-center ${activeTab === 'login' ? 'active' : ''}`}
              >
                <i className="bi bi-box-arrow-in-right mr-1.5"></i>
                Masuk
              </button>
              <button 
                onClick={() => switchTab('register')} 
                className={`auth-tab-btn flex items-center justify-center ${activeTab === 'register' ? 'active' : ''}`}
              >
                <i className="bi bi-person-plus-fill mr-1.5"></i>
                Daftar Baru
              </button>
            </div>

            {/* Login Form Content */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <label htmlFor="login-username" className="form-label-custom">Username</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    id="login-username" 
                    placeholder="Masukkan username Anda..."
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="login-password" className="form-label-custom">Password</label>
                  <input 
                    type="password" 
                    className="form-control-custom" 
                    id="login-password" 
                    placeholder="Masukkan password Anda..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-navy w-full py-2.5 font-bold flex items-center justify-center gap-2 rounded-lg text-white"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <i className="bi bi-box-arrow-in-right"></i>
                  )}
                  Masuk
                </button>
              </form>
            )}

            {/* Register Form Content */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit}>
                <div className="mb-3">
                  <label htmlFor="register-username" className="form-label-custom">Username</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    id="register-username" 
                    placeholder="Nama atau username unik..."
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    required
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Minimal 3 karakter.</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="register-password" className="form-label-custom">Password</label>
                  <input 
                    type="password" 
                    className="form-control-custom" 
                    id="register-password" 
                    placeholder="Buat password aman..."
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Minimal 6 karakter.</div>
                </div>
                <div className="mb-5">
                  <label htmlFor="register-angkatan" className="form-label-custom">Pilih Angkatan Anda</label>
                  <input 
                    type="number" 
                    className="form-control-custom" 
                    id="register-angkatan" 
                    placeholder="Contoh: 2024" 
                    min="1990" 
                    max="2100" 
                    value={registerAngkatan}
                    onChange={(e) => setRegisterAngkatan(e.target.value)}
                    required
                  />
                  <div className="text-[10px] text-red-500 font-semibold mt-1">
                    Peringatan: Pilihan angkatan ini permanen dan menentukan kamar mana yang bisa Anda kirimi pesan!
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-gold w-full py-2.5 font-bold flex items-center justify-center gap-2 rounded-lg text-slate-900"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
                  ) : (
                    <i className="bi bi-person-check-fill"></i>
                  )}
                  Daftar Sekarang
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
