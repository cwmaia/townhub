import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TownHub | Stykkishólmur",
  description:
    "Discover services, stays, restaurants, attractions and events in Stykkishólmur, Iceland.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-sky-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
