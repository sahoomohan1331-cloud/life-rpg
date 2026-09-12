import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Life RPG — Turn Your Life Into an Adventure",
    template: "%s | Life RPG",
  },
  description:
    "Transform everyday tasks into epic quests. Earn XP, level up your character, and watch your cozy study room grow as you build real-world habits.",
  keywords: ["productivity", "gamification", "RPG", "habit tracker", "task manager", "life RPG"],
  openGraph: {
    title: "Life RPG — Turn Your Life Into an Adventure",
    description: "Transform everyday tasks into epic quests. Earn XP, level up, and build real habits.",
    type: "website",
    locale: "en_US",
    siteName: "Life RPG",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cream text-brown-dark antialiased">
        {/* Aria-live region for screen reader announcements */}
        <div
          id="announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
        {children}
      </body>
    </html>
  );
}
