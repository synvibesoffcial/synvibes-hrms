import InviteUsersContent from "./InviteUsersContent";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function InviteUsersPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6 mt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users and send invitations</p>
            </div>
          </div>
          
          {/* <Link href="/admin">
            <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
          </Link> */}
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link href="/admin" className="border-b-2 border-transparent pb-3 hover:border-gray-300">
              <span className="text-gray-500 hover:text-gray-700 font-medium text-sm">User Management</span>
            </Link>
            <div className="border-b-2 border-blue-500 pb-3">
              <span className="text-blue-600 font-medium text-sm">User Invitations</span>
            </div>
          </nav>
        </div>
      </div>

      <InviteUsersContent />
    </div>
  );
} 