import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import QueryProvider from '@/src/context/react-query-context';
import '@/src/styles/globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Declutter',
    description: 'Swipe to unsubscribe from the YouTube channel',
    metadataBase: new URL(process.env.BASE_URL as string),
    openGraph: {
        title: 'Declutter',
        description: '스와이프 한 번으로 유튜브 구독 취소 🧹',
        url: '/',
        siteName: 'Declutter',
        locale: 'ko_KR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Declutter',
        description: '스와이프 한 번으로 유튜브 구독 취소 🧹',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
