import { checkUser } from '@/lib/checkUser'
import { redirect } from 'next/navigation'
import DoctorSidebar from './_components/DoctorSidebar'
import DoctorHeader from './_components/DoctorHeader'

export async function generateMetadata() {
  const user = await checkUser()
  
  if (!user || user.role !== "DOCTOR") {
    return {
      title: "Doctor Dashboard - TibaPoint",
      description: "Doctor dashboard for managing appointments and profile",
    }
  }

  // Build dynamic title
  let title = "Dashboard"
  if (user.name && user.speciality) {
    title = `${user.name} | ${user.speciality}`
  } else if (user.name) {
    title = `${user.name} | Doctor`
  }

  return {
    title: `${title} - TibaPoint`,
    description: `Doctor dashboard for ${user.name} specializing in ${user.speciality || 'healthcare'}. Manage appointments, profile, and patient care.`,
    openGraph: {
      title: `${title} - TibaPoint`,
      description: `Doctor profile for ${user.name} specializing in ${user.speciality || 'healthcare'}`,
      type: 'profile',
    },
  }
}

export default async function DoctorLayout({ children }) {
  const user = await checkUser()

  if (!user) redirect("/sign-in")
  
  if (user.role !== "DOCTOR") {
    redirect("/")
  }

  // For unverified doctors, show a limited layout
  const isVerified = user.verificationStatus === "VERIFIED"

  return (
    <div className="min-h-screen ">
      {isVerified ? (
        <div className="flex flex-col lg:flex-row ">
          {/* Sidebar  */}
          <div className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
            <DoctorSidebar user={user} />
          </div>
          
          {/* Main content */}
          <div className="lg:pl-64 flex-1">
            {/* Mobile header */}
            <div className="sticky top-0 z-40 lg:hidden">
              <DoctorHeader user={user} />
            </div>
            
            {/* Desktop header */}
            <div className="hidden lg:block">
              <DoctorHeader user={user} />
            </div>
            
            {/* Page content */}
            <main className="p-4 lg:p-6">
              {children}
            </main>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <main>
            {children}
          </main>
        </div>
      )}
    </div>
  )
}
