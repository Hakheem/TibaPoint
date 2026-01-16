// app/admin/layout.jsx
import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import AdminSidebar from "./_components/AdminSidebar";
import AdminHeader from "./_components/AdminHeader";

export const metadata = {
  title: "Admin Dashboard - TibaPoint",
  description: "Admin dashboard for managing the TibaPoint platform",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default async function AdminLayout({ children }) {
  const user = await checkUser();

  if (!user) redirect("/sign-in");

  if (user.role !== "ADMIN") {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen  ">
      <div className="flex">
        {/* Sidebar for desktop */}
        <div className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
          <AdminSidebar user={user} />
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex-1">
          {/* Mobile header */}
          <div className="sticky top-0 z-40 lg:hidden">
            <AdminHeader user={user} />
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block">
            <AdminHeader user={user} />
          </div>

          {/* Page content */}
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
