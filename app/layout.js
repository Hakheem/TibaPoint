import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/general/theme-providerprovider";
import Footer from "@/components/general/Footerl/Footer";
import Navbar from "@/components/general/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TibaPoint | Your point of care ",
  description:
    "TibaPoint, a leading doctor appointment platform that helps patients book verified healthcare professionals instantly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}  `}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
