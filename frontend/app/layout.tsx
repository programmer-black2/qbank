import type { Metadata } from "next";
import localFont from "next/font/local";
import './globals.css';

const vazirFont = localFont({
  src: '../public/fonts/Vazir-Medium-FD-WOL.woff2',
  weight: '500',
  style: 'normal',
  variable: '--font-vazir',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Question Bank",
  description: "QuestionBank",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirFont.variable}`}
    >
      <body className={`${vazirFont.className} bg-gray-50`}>
        <main>{children}</main>
      </body>
    </html>
  );
}
