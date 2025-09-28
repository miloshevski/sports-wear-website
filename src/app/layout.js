import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import { CartProvider } from "@/lib/useCart";
import { Toaster } from "react-hot-toast"; // ✅ import toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sportska Oprema",
  description: "Купете велосипедска опрема со белгиски квалитет.",
  keywords: [
    "велосипедска опрема",
    "cycling jerseys",
    "спортска облека",
    "velosipedska oprema",
    "cycling clothing",
    "cyling gear",
  ],
  authors: [{ name: "Aleksandar Miloshevski", url: "https://miloshevski.info" }],
  creator: "Aleksandar Miloshevski",
  metadataBase: new URL("https://sportskaoprema.mk"),
  openGraph: {
    title: "Sportska Oprema",
    description: "Висококвалитетна велосипедска облека достапна на sportskaoprema.mk",
    url: "https://sportskaoprema.mk",
    siteName: "Sportska Oprema",
    images: [
      {
        url: "public/fitactive.png",
        width: 1200,
        height: 630,
        alt: "FitActive – Велосипедска облека",
      },
    ],
    locale: "mk_MK",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="mk">
      <body className={`${inter.className} bg-gradient-to-br from-gray-50 to-white text-gray-800 antialiased`}>
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '500'
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                }
              }}
            />
            <Navbar />
            <main className="min-h-[80vh]">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
