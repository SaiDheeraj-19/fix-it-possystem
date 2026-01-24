import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'FIX IT - POS & Repair Management | Kalluru',
    description: 'Pro Repair Services in Kalluru, Kurnool. Shop no 6, near ITC circle. Call: 091829 19360',
    icons: {
        icon: '/logo.png',
        shortcut: '/logo.png',
        apple: '/logo.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {children}
                <footer className="py-6 text-center bg-black">
                    <p className="text-[10px] text-gray-800 uppercase tracking-[0.2em] font-medium">
                        Built, Designed & Developed by <span className="text-gray-700 font-bold">Tech Bro</span>
                    </p>
                </footer>
            </body>
        </html>
    );
}
