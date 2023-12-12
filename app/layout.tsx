import './globals.css';
import { Inter } from 'next/font/google';
import logo from './favicon.ico';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Posture Monitor',
  description: 'No more slouching on the job',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-gray-200 bg-black">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <span className="flex items-center space-x-3 rtl:space-x-reverse">
              <img src={logo.src} className="h-10 rounded-full bg-white" alt="Posture Monitor Logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Posture Monitor</span>
            </span>
          </div>
        </nav>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
