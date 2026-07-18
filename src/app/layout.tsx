import type { Metadata } from "next";
import { Cairo, Pinyon_Script, Cormorant_Garamond, Tajawal, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import FloatingChatButton from "@/components/FloatingChatButton";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { CompareProvider } from "@/components/CompareProvider";
import { RecentlyViewedProvider } from "@/components/RecentlyViewedProvider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const pinyonScript = Pinyon_Script({
  variable: "--font-pinyon-script",
  subsets: ["latin"],
  weight: "400",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${pinyonScript.variable} ${cormorantGaramond.variable} ${tajawal.variable} ${playfairDisplay.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <CartProvider>
            <WishlistProvider>
              <CompareProvider>
                <RecentlyViewedProvider>
                  <ToastProvider>
                    {children}
                    <FloatingChatButton />
                  </ToastProvider>
                </RecentlyViewedProvider>
              </CompareProvider>
            </WishlistProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
