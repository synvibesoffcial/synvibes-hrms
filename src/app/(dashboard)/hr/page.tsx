import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Users, 
  Clock, 
  FileText, 
  BarChart3, 
  Calendar, 
  Settings, 
  ExternalLink,
  Building,
  UserCog 
} from "lucide-react"
import { getAllEmployees, getHRDashboardStats } from "@/actions/hr"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const HRPage = async () => {
  // Check HR authorization
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session?.role !== 'hr') {
    redirect('/sign-in');
  }

  // Fetch dashboard data
  const [employees, stats] = await Promise.all([
    getAllEmployees(),
    getHRDashboardStats(),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 pt-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
        </div>
        <p className="text-gray-600">Manage human resources operations and employee lifecycle</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.presentToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingLeaves}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Hires</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newHires}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="border-b border-purple-200">
            <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Link href="/hr/department-management">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900">Manage Departments</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </Link>

              <Link href="/hr/team-management">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">Manage Teams</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </Link>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="font-medium text-gray-900">Review Leave Requests</span>
                </div>
                <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                  {stats.pendingLeaves} Pending
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-900">Attendance Reports</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Generate</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900">Payroll Processing</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Ready</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="border-b border-purple-200">
            <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New employee onboarded</p>
                  <p className="text-xs text-gray-600">Sarah Johnson joined Marketing team</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Leave request submitted</p>
                  <p className="text-xs text-gray-600">John Doe requested 3 days leave</p>
                  <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payroll processed</p>
                  <p className="text-xs text-gray-600">Monthly payroll for December completed</p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Policy updated</p>
                  <p className="text-xs text-gray-600">Remote work policy has been revised</p>
                  <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}

export default HRPage
