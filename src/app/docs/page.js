'use client';

import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Docs() {
  const [loading, setLoading] = useState(true);

  // Spesifikasi OpenAPI 3.0 dalam format JSON
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Memoria Place API',
      description: 'Dokumentasi API untuk Kapsul Waktu Lintas Angkatan (Memoria Place) menggunakan Next.js App Router.',
      version: '1.0.0',
    },
    servers: [
      {
        url: '/api',
        description: 'Server API Lokal',
      },
    ],
    paths: {
      '/register': {
        post: {
          summary: 'Daftar Akun Baru',
          description: 'Mendaftarkan alumni baru ke sistem.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password', 'angkatan'],
                  properties: {
                    username: { type: 'string', minLength: 3, example: 'RaniaTarisa' },
                    password: { type: 'string', minLength: 6, example: 'secret123' },
                    angkatan: { type: 'string', example: '2024' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Registrasi berhasil',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      message: { type: 'string', example: 'Registrasi berhasil' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          username: { type: 'string', example: 'RaniaTarisa' },
                          angkatan: { type: 'string', example: '2024' },
                        },
                      },
                      token: { type: 'string', example: 'eyJhbGciOiJI...' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Validasi gagal atau Username sudah digunakan',
            },
          },
        },
      },
      '/login': {
        post: {
          summary: 'Masuk Akun',
          description: 'Mengautentikasi alumni dan mendapatkan token JWT.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password'],
                  properties: {
                    username: { type: 'string', example: 'RaniaTarisa' },
                    password: { type: 'string', example: 'secret123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login berhasil',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      message: { type: 'string', example: 'Login berhasil' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          username: { type: 'string', example: 'RaniaTarisa' },
                          angkatan: { type: 'string', example: '2024' },
                        },
                      },
                      token: { type: 'string', example: 'eyJhbGciOiJI...' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Username atau password salah',
            },
          },
        },
      },
      '/logout': {
        post: {
          summary: 'Keluar Akun',
          description: 'Menyelesaikan sesi aktif pengguna (Memerlukan Otorisasi Bearer Token).',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Logout berhasil',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      message: { type: 'string', example: 'Logout berhasil' },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthenticated (Token tidak valid atau tidak disertakan)',
            },
          },
        },
      },
      '/angkatan/stats': {
        get: {
          summary: 'Ambil Statistik Angkatan',
          description: 'Mengambil data statistik jumlah pesan terdaftar per angkatan secara dinamis untuk lobi (Memerlukan Otorisasi Bearer Token).',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'Berhasil mengambil statistik',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            angkatan: { type: 'string', example: '2024' },
                            count: { type: 'integer', example: 5 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthenticated',
            },
          },
        },
      },
      '/messages/{angkatan}': {
        get: {
          summary: 'Ambil Pesan Ruang Angkatan',
          description: 'Mengambil daftar pesan memori dari satu angkatan tertentu (Memerlukan Otorisasi Bearer Token).',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'angkatan',
              in: 'path',
              required: true,
              description: 'Tahun angkatan yang dicari',
              schema: { type: 'string', example: '2024' },
            },
          ],
          responses: {
            200: {
              description: 'Berhasil mengambil pesan',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'integer', example: 12 },
                            text: { type: 'string', example: 'Sukses selalu kawan!' },
                            angkatan: { type: 'string', example: '2024' },
                            username: { type: 'string', example: 'alumni_hebat' },
                            created_at: { type: 'string', example: '2026-05-30T01:52:29.000Z' },
                            formatted_date: { type: 'string', example: '30 Mei 2026' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthenticated',
            },
          },
        },
      },
      '/messages': {
        post: {
          summary: 'Kirim Pesan Kenangan Baru',
          description: 'Menyimpan teks memori baru ke database, hanya bisa dilakukan jika angkatan pengirim cocok (Memerlukan Otorisasi Bearer Token).',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['angkatan', 'text'],
                  properties: {
                    angkatan: { type: 'string', example: '2024' },
                    text: { type: 'string', example: 'Kenangan terindah di masa SMA!' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Pesan berhasil disimpan',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      message: { type: 'string', example: 'Pesan berhasil ditambahkan' },
                      data: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 15 },
                          text: { type: 'string', example: 'Kenangan terindah di masa SMA!' },
                          angkatan: { type: 'string', example: '2024' },
                          username: { type: 'string', example: 'alumni_hebat' },
                          created_at: { type: 'string', example: '2026-05-30T02:15:00.000Z' },
                          formatted_date: { type: 'string', example: '30 Mei 2026' },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Unauthenticated',
            },
            403: {
              description: 'Forbidden (Mencoba mengirim pesan ke ruang memori angkatan lain)',
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Masukkan Token JWT Anda yang didapatkan dari login/register.',
        },
      },
    },
  };

  useEffect(() => {
    // Muat CSS dan JS Swagger UI secara dinamis
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.onload = () => {
      const presetsScript = document.createElement('script');
      presetsScript.src = 'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js';
      presetsScript.onload = () => {
        if (window.SwaggerUIBundle) {
          window.SwaggerUIBundle({
            spec: openApiSpec,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              window.SwaggerUIBundle.presets.apis,
              window.SwaggerUIStandalonePreset,
            ],
            layout: 'BaseLayout',
          });
          setLoading(false);
        }
      };
      document.body.appendChild(presetsScript);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup jika berpindah halaman
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-slate-900 text-white py-4 px-8 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold">Memoria Place API Spec</h1>
          <p className="text-xs text-slate-400">Dokumentasi API Swagger UI Interaktif</p>
        </div>
        <a href="/" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition text-sm">
          Kembali ke Beranda
        </a>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-[80vh] text-slate-600">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
          <p className="font-semibold">Memuat Swagger UI...</p>
        </div>
      )}

      <div id="swagger-ui" className={loading ? 'hidden' : 'p-4 md:p-8 bg-white max-w-7xl mx-auto my-6 rounded-xl shadow-sm border border-slate-100'} />
    </div>
  );
}
