import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SupabaseProvider from "@/providers/SupabaseProvider";
import UserProvider from "@/providers/UserProvider";
import ModalProvider from "@/providers/ModalProvider";
import ToasterProvider from "@/providers/ToasterProvider";
import getSongsByTitle from "@/actions/getSongsByTitle";
import Player from "@/components/Player";
import getActiveProductsWithPrices from "@/actions/getActiveProductsWithPrices";
const font = Figtree({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lyriks",
  description: "Find your tune!",
};

  export const revalidate = 0;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode; 
}>) {
  
  const userSongs = await getSongsByTitle();
  const products = await getActiveProductsWithPrices();
 
  return (
    <html lang="en">
      <body
        className={`${font.variable} antialiased`}
      >
        <ToasterProvider/>
        <SupabaseProvider>
          <UserProvider>
            <ModalProvider products = {products}/>
              <Sidebar songs = {userSongs}>
              {children}
            </Sidebar>
            <Player/>
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
