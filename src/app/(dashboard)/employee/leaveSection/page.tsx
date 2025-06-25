import { cookies } from "next/headers"
import { decrypt } from "@/lib/session"
import { getEmployeeByUserId } from "@/lib/dal"
import { getEmployeeLeaves } from "../employeeActions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LeaveRequestForm from "../LeaveRequestForm"
import { Calendar, Briefcase } from "lucide-react"

export default async function LeaveSectionPage() {
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

  const leaves = await getEmployeeLeaves(employee.id)

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your leave requests and view history
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Leave Balance</p>
                <p className="text-2xl font-bold text-green-900">24 Days</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
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
              <Briefcase className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Requests</p>
                <p className="text-2xl font-bold text-blue-900">{leaves?.length || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-purple-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            New Leave Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveRequestForm employeeId={employee.id} />
        </CardContent>
      </Card>

      {leaves && leaves.length > 0 ? (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">Leave Request</h4>
                    <Badge
                      className={
                        leave.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : leave.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {leave.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Start Date:</span>
                      <span className="ml-2 text-gray-900">{leave.startDate.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">End Date:</span>
                      <span className="ml-2 text-gray-900">{leave.endDate.toLocaleDateString()}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-600">Reason:</span>
                      <span className="ml-2 text-gray-900">{leave.reason}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Applied On:</span>
                      <span className="ml-2 text-gray-900">{leave.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 