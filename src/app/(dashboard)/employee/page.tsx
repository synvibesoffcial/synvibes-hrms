import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { getUserById, getEmployeeByUserId } from '@/lib/dal';
import { getEmployeeLeaves, getTodayAttendance } from './employeeActions';
import { redirect } from 'next/navigation';
import EmployeeOnboardingForm from '@/components/ui/EmployeeOnboardingForm';
import { Card, CardContent } from '@/components/ui/card';
import { User, Calendar, Clock, FileText, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { User as UserType } from '@prisma/client';

export default async function EmployeePage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect('/sign-in');
  }

  const user = await getUserById(session.userId as string);

  if (!user) {
    redirect('/sign-in');
  }

  const employee = await getEmployeeByUserId(user.id);

  // If no employee profile exists, show onboarding form
  if (!employee) {
    return <EmployeeOnboardingForm user={user as UserType} />;
  }

  // If employee profile exists, show dashboard
  const [leaves, todayAttendance] = await Promise.all([
    getEmployeeLeaves(employee.id),
    getTodayAttendance(employee.id),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {employee.firstName} {employee.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Today&apos;s Status</p>
                <p className="text-2xl font-bold text-blue-900">{todayAttendance?.checkIn ? "Present" : "Absent"}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-900">
                  {leaves?.filter((l) => l.status === "PENDING").length || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/employee/profileSection" className="group">
          <Card className="border-gray-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Profile</h3>
                    <p className="text-sm text-gray-600">View personal information</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employee/leaveSection" className="group">
          <Card className="border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-md cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Leave Requests</h3>
                    <p className="text-sm text-gray-600">Manage leave applications</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employee/attendanceSection" className="group">
          <Card className="border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Attendance</h3>
                    <p className="text-sm text-gray-600">Track attendance records</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employee/payslipSection" className="group">
          <Card className="border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">Payslips</h3>
                    <p className="text-sm text-gray-600">Download salary payslips</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}