import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { RoleProvider } from "@/providers/role-provider";
import { Suspense } from "react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: 'swap',
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400","500","600","700"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AulaCore - Plataforma de Educación Digital",
  description: "Sistema integrado de gestión educativa institucional",
  icons: {
    icon: "/logo-aulacore.png",
    shortcut: "/logo-aulacore.png",
    apple: "/logo-aulacore.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="h-full m-0 p-0">
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <AuthProvider>
          <RoleProvider>
            {children}
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
