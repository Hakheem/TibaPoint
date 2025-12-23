import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/general/theme-provider";
import Footer from "@/components/general/Footer";
import Navbar from "@/components/general/Navbar";
import {
  ClerkProvider,
} from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TibaPoint | Your Healthcare, Simplified ",
  description:
    "TibaPoint, a leading doctor appointment platform that helps patients book verified healthcare professionals instantly.",
};

export default function RootLayout({ children }) {
  return (
     <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}  `}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* <Navbar /> */}
          {children}
          {/* <Footer /> */}
        </ThemeProvider>
      </body>
    </html>
     </ClerkProvider>
  );
}
