"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/(dashboard)/admin", label: "Admin" },
  { href: "/employee", label: "Employee" },
  { href: "/(dashboard)/hr", label: "HR" },
  { href: "/(dashboard)/user", label: "User" },
];

export default function Sidebar() {
  const pathname = usePathname();
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