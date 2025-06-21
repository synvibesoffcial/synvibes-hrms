"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Define role-based link configurations
const roleBasedLinks = {
  superadmin: [
    { href: "/superadmin", label: "Super Admin" },
    { href: "/admin", label: "Admin" },
    { href: "/hr", label: "HR" },
    { href: "/employee", label: "Employee" },
    { href: "/user", label: "User" },
  ],
  admin: [
    { href: "/admin", label: "Admin" },
    { href: "/user", label: "User" },
  ],
  hr: [
    { href: "/hr", label: "HR" },
    { href: "/user", label: "User" },
  ],
  employee: [
    { href: "/employee", label: "Employee" },
    { href: "/user", label: "User" },
  ],
  // Fallback for users without role or null role
  default: [
    { href: "/user", label: "User" },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session data from cookies and decrypt to get user role
    const getSessionData = async () => {
      try {
        const response = await fetch('/api/session', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role || 'default');
        } else {
          setUserRole('default');
        }
      } catch (error) {
        console.error('Failed to fetch session:', error);
        setUserRole('default');
      } finally {
        setLoading(false);
      }
    };

    getSessionData();
  }, []);

  if (loading) {
    return (
      <aside className="w-56 bg-white border-r h-full flex flex-col py-6 px-2 shadow-sm">
        <div className="flex items-center justify-center h-20">
          <div className="text-gray-500">Loading...</div>
        </div>
      </aside>
    );
  }

  // Get links based on user role
  const links = roleBasedLinks[userRole as keyof typeof roleBasedLinks] || roleBasedLinks.default;

  return (
    <aside className="w-56 bg-white border-r h-full flex flex-col py-6 px-2 shadow-sm">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 rounded text-gray-700 font-medium hover:bg-purple-100 transition-colors ${pathname === link.href ? "bg-purple-500 text-white" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 