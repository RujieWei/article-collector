import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Article Collector",
  description: "个人文章收藏管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="bg-white border-b border-slate-100">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <a
              href="/"
              className="text-base font-semibold tracking-tight text-slate-800"
            >
              Article Collector
            </a>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-4 text-xs text-slate-400">
            &copy; 2026 Article Collector
          </div>
        </footer>
      </body>
    </html>
  );
}
