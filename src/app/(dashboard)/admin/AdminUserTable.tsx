"use client"
import { useTransition, useState } from "react"
import { updateUserRole } from "@/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Role = "superadmin" | "admin" | "hr" | "employee"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role | null
}

const roleOptions = [
  { value: "hr", label: "HR" },
  { value: "employee", label: "Employee" },
]

export default function AdminUserTable({ users }: { users: User[] }) {
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<Record<string, Role | null>>(() =>
    Object.fromEntries(users.map((u) => [u.id, u.role])),
  )
  const [isPending, startTransition] = useTransition()

  const handleRoleChange = (userId: string, newRole: Role) => {
    setPendingUserId(userId)
    startTransition(async () => {
      await updateUserRole(userId, newRole)
      setUserRoles((prev: Record<string, Role | null>) => ({ ...prev, [userId]: newRole }))
      setPendingUserId(null)
    })
  }

  return (
    <div>
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="border-purple-200">
          <CardTitle className="text-xl text-purple-900">Manage User Roles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-300 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Current Role</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                    <td className="py-4 px-6">
                      {userRoles[user.id] ? (
                        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                          {userRoles[user.id]}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          Unassigned
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <select
                          className="border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                          value={userRoles[user.id] ?? ""}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          disabled={pendingUserId === user.id || isPending}
                        >
                          <option value="">Select Role</option>
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        {pendingUserId === user.id && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-purple-600">Updating...</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
