import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/app/lib/contexts/auth-context";
import { BoekjeProvider } from "@/app/lib/contexts/boekje-context";
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
  title: "Huishoudboekje",
  description: "Samen je huishoudboekje beheren",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <BoekjeProvider>{children}</BoekjeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
