'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Kamar({ params }) {
  const router = useRouter();
  const [angkatan, setAngkatan] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Membaca params secara asinkron (karena Next.js 15 params bertipe Promise)
    const resolveParamsAndLoad = async () => {
      try {
        const resolvedParams = await params;
        const currentRoomYear = resolvedParams.angkatan;
        setAngkatan(currentRoomYear);

        // Verifikasi autentikasi
        const token = localStorage.getItem('kw_token');
        const session = localStorage.getItem('kw_session');

        if (!token || !session) {
          router.push('/auth?mode=login&alert=unauthorized');
          return;
        }

        const user = JSON.parse(session);
        setCurrentUser(user);

        // Muat pesan
        await fetchMessages(currentRoomYear, token);
      } catch (err) {
        console.error(err);
        setError('Gagal memproses parameter halaman');
        setLoading(false);
      }
    };

    resolveParamsAndLoad();
  }, [params, router]);

  const fetchMessages = async (roomYear, token) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/messages/${roomYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const payload = await res.json();

      if (res.status === 401) {
        localStorage.removeItem('kw_token');
        localStorage.removeItem('kw_session');
        window.dispatchEvent(new Event('auth-change'));
        router.push('/auth?mode=login&alert=unauthorized');
        return;
      }

      if (payload.status === 'success') {
        setMessages(payload.data || []);
      } else {
        setError(payload.message || 'Gagal memuat daftar pesan');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal menghubungkan ke database');
    } finally {
      setLoading(false);
    }
  };

  // Proteksi XSS sederhana
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  const isMyAngkatan = currentUser && currentUser.angkatan.toString() === angkatan.toString();

  return (
    <main className="flex-1 bg-slate-50 min-h-screen">
      {/* Header Banner Kamar */}
      <header className="room-header-section text-center relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Link 
            href="/" 
            className="btn-outline-gold absolute top-4 left-4 text-xs py-1.5 px-3 no-underline hidden md:inline-block text-white"
          >
            <i className="bi bi-arrow-left mr-1"></i> Kembali ke Lobi
          </Link>
          <Link 
            href="/" 
            className="btn-outline-gold text-xs py-1.5 px-3 mb-3 inline-block md:hidden text-white no-underline"
          >
            <i className="bi bi-arrow-left mr-1"></i> Kembali ke Lobi
          </Link>

          <div>
            <span className="room-badge">ANGKATAN {angkatan}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
            Ruang Memori: Angkatan {angkatan}
          </h1>
          <p className="text-slate-200 text-xs md:text-sm max-w-2xl mx-auto">
            Berbagi memori terindah, suka duka, dan impian masa depan Angkatan {angkatan}
          </p>
        </div>
      </header>

      {/* Main Content Container */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl mb-6 text-sm flex items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill text-red-500"></i>
            <div>{error}</div>
          </div>
        )}

        {/* Restriction Banner */}
        {currentUser && (
          <>
            {isMyAngkatan ? (
              <div className="text-center my-6">
                <Link 
                  href={`/tulis?angkatan=${angkatan}`} 
                  className="btn-gold py-3.5 px-8 shadow-lg text-lg flex items-center gap-2 justify-center max-w-xs mx-auto no-underline rounded-xl"
                >
                  <i className="bi bi-pencil-square"></i>
                  Tulis Pesan & Kesan
                </Link>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-xl mb-8 flex gap-3 animate-fade-in shadow-sm">
                <i className="bi bi-info-circle-fill text-blue-500 text-2xl"></i>
                <div>
                  <h6 className="font-bold text-blue-900 text-sm">Mode Baca Arsip Aktif</h6>
                  <p className="text-blue-700 text-xs mt-1">
                    Anda masuk sebagai <strong>{currentUser.username} (Angkatan {currentUser.angkatan})</strong>. 
                    Anda hanya diperbolehkan menulis pesan di kamar angkatan Anda sendiri.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Message Board Section */}
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="bi bi-chat-left-quote-fill text-yellow-500"></i>
          Papan Pesan Angkatan
        </h3>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-3"></div>
            <p className="text-sm font-semibold">Mengambil lembaran memori...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state animate-fade-in max-w-lg mx-auto py-12 px-6">
            <i className="bi bi-envelope-open-fill empty-state-icon text-slate-300 text-5xl mb-3 block"></i>
            <h4 className="empty-state-title text-lg font-bold text-slate-800">Ruang Memori Masih Kosong</h4>
            <p className="text-slate-500 text-xs mt-2">
              Belum ada kenangan yang diunggah di kamar angkatan ini.{' '}
              {isMyAngkatan && 'Jadilah orang pertama yang mengisinya!'}
            </p>
            {isMyAngkatan && (
              <Link href={`/tulis?angkatan=${angkatan}`} className="btn-gold text-xs py-2 px-4 inline-block mt-4 no-underline">
                Tulis Sekarang
              </Link>
            )}
          </div>
        ) : (
          <div className="message-grid mt-6">
            {messages.map((msg, index) => (
              <div 
                key={msg.id} 
                className="polaroid-card animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div 
                  className="polaroid-content"
                  dangerouslySetInnerHTML={{ __html: escapeHTML(msg.text) }}
                />
                <div className="polaroid-footer">
                  <div className="polaroid-author">@{msg.username}</div>
                  <div className="polaroid-date">{msg.formatted_date}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
