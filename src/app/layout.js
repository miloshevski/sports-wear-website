import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import { CartProvider } from "@/lib/useCart"; // ✅ ADD THIS

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sportska Oprema",
  description: "Купете велосипедска опрема со белгиски квалитет.",
  keywords: ["велосипедска опрема", "cycling jerseys", "спортска облека", "velosipedska oprema", "cycling clothing", "cyling gear"],
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
    <html lang="en">
      <body className={`${inter.className} bg-white text-zinc-900`}>
        <AuthProvider>
          <CartProvider>
            {" "}
            {/* ✅ Wrap everything inside CartProvider */}
            <Navbar />
            <main className="min-h-[80vh] bg-white px-4 sm:px-8">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
