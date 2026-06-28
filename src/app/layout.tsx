import type { Metadata, Viewport } from "next";
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
  title: "꿈보다 해몽",
  description: "당신의 꿈을 해석해드립니다",
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: '꿈보다 해몽',
    description: '당신의 꿈을 해석해드립니다',
    images: [
      {
        url: 'https://ggoom-boda-haemong.vercel.app/og-image.png', // /public/og-image.png
        width: 1200,
        height: 630,
      }
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}