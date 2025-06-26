import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  MapPin, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle, 
  AlertCircle,
  Download
} from "lucide-react"
import { getEmployeeById } from "@/actions/hr"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface EmployeeProfilePageProps {
  params: {
    id: string
  }
}

export default async function EmployeeProfilePage({ params }: EmployeeProfilePageProps) {
  // Check HR authorization
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session?.role !== 'hr') {
    redirect('/sign-in');
  }

  const employee = await getEmployeeById(params.id);

  if (!employee) {
    notFound();
  }

  // Calculate stats
  const totalLeaves = employee.leaves.length;
  const pendingLeaves = employee.leaves.filter(leave => leave.status === 'PENDING').length;
  const recentPayslips = employee.payslips.slice(0, 3);

  // Calculate attendance percentage for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthAttendance = employee.attendance.filter(att => {
    const attDate = new Date(att.date);
    return attDate.getMonth() === currentMonth && attDate.getFullYear() === currentYear;
  });
  
  const workingDaysInMonth = 22; // Approximate
  const attendancePercentage = Math.round((monthAttendance.length / workingDaysInMonth) * 100);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 pt-8">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-semibold">
              {employee.firstName[0]}{employee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-gray-600">Employee ID: {employee.empId}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href={`/hr/${params.id}/leave-approval`}>
          <Button className="w-full h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center">
            <CheckCircle className="w-6 h-6 mb-1" />
            <span>Manage Leaves</span>
          </Button>
        </Link>
        
        <Link href={`/hr/${params.id}/attendance-log`}>
          <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center">
            <Clock className="w-6 h-6 mb-1" />
            <span>Attendance Log</span>
          </Button>
        </Link>

        <Link href={`/hr/${params.id}/payslip-upload`}>
          <Button className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center">
            <FileText className="w-6 h-6 mb-1" />
            <span>Upload Payslip</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{attendancePercentage}%</p>
                <p className="text-xs text-gray-500">This month</p>
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
                <p className="text-2xl font-bold text-gray-900">{pendingLeaves}</p>
                <p className="text-xs text-gray-500">Awaiting approval</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leaves</p>
                <p className="text-2xl font-bold text-gray-900">{totalLeaves}</p>
                <p className="text-xs text-gray-500">This year</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Payslips</p>
                <p className="text-2xl font-bold text-gray-900">{employee.payslips.length}</p>
                <p className="text-xs text-gray-500">Available</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employee Profile */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="border-b border-purple-200">
            <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Employee Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">First Name</p>
                  <p className="text-gray-900">{employee.firstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Name</p>
                  <p className="text-gray-900">{employee.lastName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Employee ID</p>
                  <p className="text-gray-900 font-mono">{employee.empId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Join Date</p>
                  <p className="text-gray-900">{new Date(employee.joinDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Date of Birth</p>
                  <p className="text-gray-900">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Gender</p>
                  <p className="text-gray-900 capitalize">{employee.gender}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="text-gray-900">{employee.user.email}</p>
              </div>

              {employee.contactInfo && (
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contact Info
                  </p>
                  <p className="text-gray-900">{employee.contactInfo}</p>
                </div>
              )}

              {employee.address && (
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </p>
                  <p className="text-gray-900">{employee.address}</p>
                </div>
              )}

              {employee.team && (
                <div>
                  <p className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Team & Department
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-800">
                      {employee.team.name}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      {employee.team.department.name}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="border-b border-purple-200">
            <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Recent Leaves */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recent Leave Requests</h3>
                {employee.leaves.length > 0 ? (
                  <div className="space-y-2">
                    {employee.leaves.slice(0, 3).map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{leave.reason}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={
                          leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {leave.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No leave requests yet</p>
                )}
              </div>

              {/* Recent Payslips */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recent Payslips</h3>
                {recentPayslips.length > 0 ? (
                  <div className="space-y-2">
                    {recentPayslips.map((payslip) => (
                      <div key={payslip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payslip.month} {payslip.year}
                          </p>
                          <p className="text-xs text-gray-600">
                            Generated: {new Date(payslip.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="text-purple-600">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No payslips available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
