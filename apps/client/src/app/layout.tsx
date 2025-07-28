import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { OrientationGuard } from "@/components/orientation";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { RouteGuard } from "@/components/layout/RouteGuard";
import { GlobalStateProvider } from "@/context/GlobalStateProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SURA Esencia Fest 2025",
  description: "Plataforma virtual para evento SURA - Semana del 18 de agosto 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <GlobalStateProvider>
              <RouteGuard>
                <OrientationGuard>
                  {children}
                </OrientationGuard>
              </RouteGuard>
            </GlobalStateProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
