import { getAllUsers } from "@/actions/auth";
import AdminUserTable from "./AdminUserTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, Users } from "lucide-react";

export default async function AdminPage() {
  const allUsers = await getAllUsers();
  const users = allUsers.filter(user => user.role !== 'superadmin');
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users and send invitations</p>
            </div>
          </div>
          
          <Link href="/admin/invite-users">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Mail className="w-4 h-4 mr-2" />
              Invite Users
            </Button>
          </Link>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <div className="border-b-2 border-purple-500 pb-3">
              <span className="text-purple-600 font-medium text-sm">User Management</span>
            </div>
            <Link href="/admin/invite-users" className="border-b-2 border-transparent pb-3 hover:border-gray-300">
              <span className="text-gray-500 hover:text-gray-700 font-medium text-sm">User Invitations</span>
            </Link>
          </nav>
        </div>
      </div>

      <AdminUserTable users={users} />
    </div>
  );
}