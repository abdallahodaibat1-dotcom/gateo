import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import FloatingChatButton from "@/components/FloatingChatButton";
import { ToastProvider } from "@/components/ui/Toast";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Gateo | منصة الأعمال والمحترفين",
  description: "منصة Gateo - اكتشف الأعمال، المحترفين، والخدمات في قطاعات متعددة. تواصل مع الخبراء، احجز مواعيدك، وطوّر عملك في مكان واحد.",
  keywords: "أعمال, محترفين, خدمات, عيادات, مهندسين, محامين, أكاديميات, Gateo",
  icons: {
    icon: "/logo/favicon.svg",
    shortcut: "/logo/favicon.svg",
    apple: "/logo/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <ToastProvider>
            {children}
            <FloatingChatButton />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
