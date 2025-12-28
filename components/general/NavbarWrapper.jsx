import { checkUser } from '@/lib/checkUser'
import Navbar from './Navbar'

export default async function NavbarWrapper() {
  const dbUser = await checkUser()
  
  return <Navbar dbUser={dbUser} />
}

