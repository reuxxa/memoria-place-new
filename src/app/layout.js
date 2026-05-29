import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Memoria Place - Kapsul Waktu Lintas Angkatan",
  description: "Abadikan kenangan, pesan, kesan, dan impian kawan-kawan seangkatanmu di arsip kapsul waktu digital Memoria Place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <head>
        {/* Bootstrap Icons CDN */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" 
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex flex-col">
          {children}
        </div>
        <footer className="footer-custom">
          <div className="max-w-7xl mx-auto px-4">
            <p className="mb-0">
              © 2026 Memoria Place Angkatan - Dibuat oleh <a href="#">Rania & Tarisa</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
