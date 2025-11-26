import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UIThemeProvider } from "@/lib/contexts/UIThemeContext";
import { CookieConsentProvider } from "@/lib/components";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { GlobalHeader } from "@/lib/components/layout/GlobalHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mostage App",
  description: "Presentation Framework",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CookieConsentProvider>
          <AuthProvider>
            <UIThemeProvider>
              <div className="h-screen flex flex-col">
                <GlobalHeader />
                <main className="flex-1 overflow-hidden">{children}</main>
              </div>
            </UIThemeProvider>
          </AuthProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
