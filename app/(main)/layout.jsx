import { checkUser } from '@/lib/checkUser'
import Footer from "@/components/general/Footer";
import Navbar from "@/components/general/Navbar";

export default async function MainLayout({ children }) {
  // Get user data on server
  const dbUser = await checkUser()
  
  return (
    <div>
      <Navbar dbUser={dbUser} />
      <main className="text-[#0C0C0C] dark:text-[#f0f8ff] min-h-screen">
        {children}
      </main>
      <Footer/>
    </div>
  )
}
