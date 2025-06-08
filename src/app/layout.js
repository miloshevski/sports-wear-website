import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CycleFit – Cycling Sportswear",
  description: "Shop professional cycling apparel and gear.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-zinc-900`}>
        <Navbar />
        <main className="min-h-[80vh] bg-white px-4 sm:px-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
