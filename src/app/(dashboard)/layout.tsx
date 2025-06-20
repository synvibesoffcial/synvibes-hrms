import Navbar from "@/components/ui/navbar";
import Sidebar from "@/components/ui/sidebar";
import LogoutButton from "@/components/ui/LogoutButton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center justify-between px-6 h-16 bg-white border-b shadow-sm">
        <Navbar />
        <LogoutButton />
      </div>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
