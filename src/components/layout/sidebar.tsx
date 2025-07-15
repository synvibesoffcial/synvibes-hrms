"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Users,
  //  BarChart3,
  //   Settings,
     User, Home } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"

// Define navigation item types
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { LucideProps } from "lucide-react";

type NavigationSubItem = {
  title: string;
  href: string;
};

type NavigationItem = {
  title: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  href?: string;
  items?: NavigationSubItem[];
};

type RoleBasedNavigation = {
  [role: string]: NavigationItem[];
};

// Define role-based navigation structure
const roleBasedNavigation: RoleBasedNavigation = {
  superadmin: [
    {
      title: "Dashboard",
      href: "/superadmin",
      icon: Home,
    },
    // {
    //   title: "User Management",
    //   icon: Users,
    //   items: [
    //     { title: "All Users", href: "/superadmin" },
    //     { title: "Admin Users", href: "/admin" },
    //     { title: "HR Users", href: "/hr" },
    //     { title: "Employees", href: "/employee" },
    //   ],
    // },
    // {
    //   title: "System Settings",
    //   icon: Settings,
    //   items: [
    //     { title: "General Settings", href: "/settings/general" },
    //     { title: "Security", href: "/settings/security" },
    //     { title: "Integrations", href: "/settings/integrations" },
    //   ],
    // },
    // {
    //   title: "Reports",
    //   icon: BarChart3,
    //   items: [
    //     { title: "System Reports", href: "/reports/system" },
    //     { title: "User Analytics", href: "/reports/users" },
    //     { title: "Activity Logs", href: "/reports/activity" },
    //   ],
    // },
  ],
  admin: [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    // {
    //   title: "User Management",
    //   icon: Users,
    //   items: [
    //     { title: "Manage Users", href: "/admin" },
    //     { title: "HR Staff", href: "/hr" },
    //     { title: "Employees", href: "/employee" },
    //   ],
    // },
    // {
    //   title: "Reports",
    //   icon: BarChart3,
    //   items: [
    //     { title: "User Reports", href: "/reports/users" },
    //     { title: "Activity Reports", href: "/reports/activity" },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   icon: Settings,
    //   items: [
    //     { title: "Organization", href: "/settings/org" },
    //     { title: "Permissions", href: "/settings/permissions" },
    //   ],
    // },
  ],
  hr: [
    {
      title: "Dashboard",
      href: "/hr",
      icon: Home,
    },
    {
      title: "Employee Management",
      href: "/hr/employeeManagement",
      icon: Users,
      // items: [
      //   { title: "All Employees", href: "/hr/employees" },
      //   { title: "Onboarding", href: "/hr/onboarding" },
      //   { title: "Departments", href: "/hr/departments" },
      //   { title: "Teams", href: "/hr/teams" },

      // ],
    },
  ],
  employee: [
    {
      title: "Dashboard",
      href: "/employee/",
      icon: Home,
    },
    // {
    //   title: "My Profile",
    //   icon: User,
    //   items: [
    //     { title: "Personal Info", href: "/employee/profile" },
    //     { title: "Documents", href: "/employee/documents" },
    //     { title: "Emergency Contacts", href: "/employee/contacts" },
    //   ],
    // },
    // {
    //   title: "Attendance",
    //   icon: Clock,
    //   items: [
    //     { title: "Check In/Out", href: "/employee/attendance" },
    //     { title: "My Attendance", href: "/employee/attendance/history" },
    //     { title: "Leave Requests", href: "/employee/leaves" },
    //   ],
    // },
    // {
    //   title: "Payroll",
    //   icon: CreditCard,
    //   items: [
    //     { title: "Payslips", href: "/employee/payslips" },
    //     { title: "Tax Documents", href: "/employee/tax" },
    //   ],
    // },
    // {
    //   title: "Team",
    //   icon: Building,
    //   items: [
    //     { title: "My Team", href: "/employee/team" },
    //     { title: "Directory", href: "/employee/directory" },
    //   ],
    // },
  ],
  default: [
    {
      title: "Waiting",
      href: "/user",
      icon: User,
    },
  ],
}

export default function Sidebar() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [openItems, setOpenItems] = useState<string[]>([])

  useEffect(() => {
    const getSessionData = async () => {
      try {
        const response = await fetch("/api/session", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setUserRole(data.role || "default")
        } else {
          setUserRole("default")
        }
      } catch (error) {
        console.error("Failed to fetch session:", error)
        setUserRole("default")
      } finally {
        setLoading(false)
      }
    }

    getSessionData()
  }, [])

  const toggleItem = (title: string) => {
    setOpenItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  if (loading) {
    return (
      <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-20">
          <div className="text-purple-500 animate-pulse">Loading...</div>
        </div>
      </aside>
    )
  }

  const navigation = roleBasedNavigation[userRole as keyof typeof roleBasedNavigation] || roleBasedNavigation.default

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const hasItems = item.items && item.items.length > 0
            const isOpen = openItems.includes(item.title)

            if (!hasItems) {
              return (
                <Link
                  key={item.title}
                  href={item.href!}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-purple-100 text-purple-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.title}
                </Link>
              )
            }

            return (
              <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.title}
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1">
                  <div className="ml-8 space-y-1">
                    {item.items?.map((subItem) => {
                      const isSubActive = pathname === subItem.href
                      return (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${isSubActive
                              ? "bg-purple-50 text-purple-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                          {subItem.title}
                        </Link>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <p>Synvibes HRMS v2.0</p>
          <p className="mt-1">© 2024 All rights reserved</p>
        </div>
      </div>
    </aside>
  )
}
