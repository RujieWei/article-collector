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
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <header className="bg-stone-50">
          <div className="mx-auto max-w-3xl px-6 pb-0 pt-10">
            <a
              href="/"
              className="text-sm font-medium tracking-widest uppercase text-stone-400"
            >
              Article Collector
            </a>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
