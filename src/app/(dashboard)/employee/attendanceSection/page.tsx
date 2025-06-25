import { cookies } from "next/headers"
import { decrypt } from "@/lib/session"
import { getEmployeeByUserId } from "@/lib/dal"
import { getEmployeeAttendance } from "../employeeActions"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import AttendanceComponent from "../AttendanceComponent"
import { Clock, Briefcase, Calendar } from "lucide-react"

export default async function AttendanceSectionPage() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get("session")?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    redirect("/sign-in")
  }

  const employee = await getEmployeeByUserId(session.userId as string)

  if (!employee) {
    redirect("/employee")
  }

  const attendance = await getEmployeeAttendance(employee.id)

  const today = new Date().toISOString().split("T")[0]
  const todayAttendance = attendance?.find((a) => {
    const date = a.date.toISOString().split("T")[0]
    return date === today
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Tracking</h1>
            <p className="text-gray-600 mt-1">
              Track your daily attendance and view history
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">This Month</p>
                <p className="text-2xl font-bold text-green-900">22 Days</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Records</p>
                <p className="text-2xl font-bold text-purple-900">{attendance?.length || 0}</p>
              </div>
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Component */}
      <AttendanceComponent employeeId={employee.id} attendance={attendance || []} />
    </div>
  )
} 