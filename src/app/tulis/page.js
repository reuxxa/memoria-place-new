'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function TulisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [angkatan, setAngkatan] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState('');
  const [text, setText] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verifikasi sesi
    const activeToken = localStorage.getItem('kw_token');
    const session = localStorage.getItem('kw_session');

    if (!activeToken || !session) {
      router.push('/auth?mode=login&alert=unauthorized');
      return;
    }

    const user = JSON.parse(session);
    setToken(activeToken);
    setCurrentUser(user);

    // Ambil angkatan dari parameter URL
    const queryAngkatan = searchParams.get('angkatan');
    setAngkatan(queryAngkatan || '');

    // Validasi otorisasi penulisan (harus angkatannya sendiri)
    if (!queryAngkatan || user.angkatan.toString() !== queryAngkatan.toString()) {
      // Jika angkatan tidak cocok, arahkan kembali ke kamar angkatan yang dicari
      if (queryAngkatan) {
        router.push(`/kamar/${queryAngkatan}`);
      } else {
        router.push('/');
      }
    }
  }, [searchParams, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!text || !text.trim()) {
      setAlert({ type: 'warning', message: 'Pesan tidak boleh kosong!' });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ angkatan, text })
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setAlert({
          type: 'success',
          message: 'Pesan Anda berhasil disimpan! Mengalihkan kembali ke Ruang Memori Angkatan...'
        });
        setText('');

        setTimeout(() => {
          router.push(`/kamar/${angkatan}`);
        }, 800);
      } else {
        setAlert({ type: 'danger', message: data.message || 'Gagal menambahkan pesan' });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: 'danger', message: 'Terjadi kesalahan saat menghubungi server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <header className="room-header-section text-center relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Link
            href={angkatan ? `/kamar/${angkatan}` : '/'}
            className="btn-outline-gold absolute top-4 left-4 text-xs py-1.5 px-3 no-underline hidden md:inline-block text-white"
          >
            <i className="bi bi-arrow-left mr-1"></i> Kembali ke Ruang Memori
          </Link>
          <Link
            href={angkatan ? `/kamar/${angkatan}` : '/'}
            className="btn-outline-gold text-xs py-1.5 px-3 mb-3 inline-block md:hidden text-white no-underline"
          >
            <i className="bi bi-arrow-left mr-1"></i> Kembali ke Ruang Memori
          </Link>

          <div>
            <span className="room-badge">RUANG ANGKATAN {angkatan}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Tulis Kenangan Anda</h1>
          <p className="text-slate-200 text-xs md:text-sm max-w-2xl mx-auto">
            Titipkan pesan berharga, impian, dan keluh kesah Anda untuk masa depan.
          </p>
        </div>
      </header>

      {/* Main Content Container */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        {/* System Alert Banner */}
        {alert && (
          <div
            className={`p-3 rounded-lg flex items-center mb-6 text-sm font-semibold ${alert.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : alert.type === 'warning'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                : 'bg-red-50 border border-red-200 text-red-800'
              }`}
          >
            <i className={`bi mr-2 text-base ${alert.type === 'success'
              ? 'bi-check-circle-fill text-green-500'
              : alert.type === 'warning'
                ? 'bi-exclamation-circle-fill text-yellow-500'
                : 'bi-x-circle-fill text-red-500'
              }`}></i>
            <div>{alert.message}</div>
          </div>
        )}

        {/* Form Card */}
        <div className="message-form-card">
          <h4 className="message-form-title text-slate-800">
            <i className="bi bi-pencil-square text-yellow-500"></i>
            Bagikan Kenangan Terindah Anda
          </h4>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="message-text" className="form-label-custom">Pesan & Kesan Anda</label>
              <textarea
                className="form-control-custom"
                id="message-text"
                rows="6"
                placeholder="Tulis apa saja... hal lucu di sekolah, harapan untuk 5-10 tahun ke depan, atau salam perpisahan terhangat..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              ></textarea>
              <div className="text-right text-xs text-slate-500 mt-2">
                Pastikan bahasa sopan dan menghargai satu sama lain.
              </div>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4 pt-3 border-t border-slate-100">
              {currentUser && (
                <span className="navbar-user-text text-slate-800 font-medium">
                  Menulis sebagai: <strong className="text-slate-900 font-semibold">@{currentUser.username} (Angkatan {currentUser.angkatan})</strong>
                </span>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-gold py-2.5 px-6 shadow-md rounded-lg flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
                ) : (
                  <i className="bi bi-send-fill"></i>
                )}
                Abadikan Pesan
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function Tulis() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <TulisContent />
    </Suspense>
  );
}
