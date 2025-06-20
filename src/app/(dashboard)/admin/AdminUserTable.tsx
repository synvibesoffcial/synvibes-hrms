"use client";
import React, { useTransition, useState } from "react";
import { updateUserRole } from "@/actions/auth";
import { Role } from "@/generated/prisma";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role | null;
}

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "hr", label: "HR" },
  { value: "employee", label: "Employee" },
  { value: "superadmin", label: "Super Admin" },
];

export default function AdminUserTable({ users }: { users: User[] }) {
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, Role | null>>(() =>
    Object.fromEntries(users.map((u) => [u.id, u.role]))
  );
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (userId: string, newRole: Role) => {
    setPendingUserId(userId);
    startTransition(async () => {
      await updateUserRole(userId, newRole);
      setUserRoles((prev: Record<string, Role | null>) => ({ ...prev, [userId]: newRole }));
      setPendingUserId(null);
    });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Manage User Roles</h1>
      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-b-0">
              <td className="py-2 px-4">{user.firstName} {user.lastName}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">
                <select
                  className="border rounded px-2 py-1"
                  value={userRoles[user.id] ?? ''}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                  disabled={pendingUserId === user.id || isPending}
                >
                  <option value="">Unassigned</option>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                {pendingUserId === user.id && (
                  <span className="ml-2 text-xs text-blue-500 animate-pulse">Updating...</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 