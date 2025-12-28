import { redirect } from "next/navigation"
import { checkUser } from "@/lib/checkUser"

export const metadata = {
  title: "Onboarding - TibaPoint",
  description: "Complete your profile to get started with TibaPoint",
}

export default async function OnboardingLayout({ children }) {
  const user = await checkUser()

  if (!user) redirect("/sign-in")

  if (user.role !== "UNASSIGNED") {
    if (user.role === "PATIENT") redirect("/doctors")
    if (user.role === "DOCTOR") redirect("/doctor")
    if (user.role === "ADMIN") redirect("/admin")
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-blue-100 via-blue-50 to-transparent dark:from-primary/30 dark:via-primary/10 dark:to-transparent">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 bg-primary/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-teal/10 blur-3xl rounded-full" />
      </div>

      {/* Page Content */}
      <main className="relative z-10">{children}</main>
    </div>
  )
}

