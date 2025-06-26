import { cookies } from "next/headers"
import { decrypt } from "@/lib/session"
import { getEmployeeByUserId } from "@/lib/dal"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Briefcase } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ProfileSectionPage() {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mt-8">
        <Link href="/employee/dashboard/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
            <p className="text-gray-600 mt-1">
              Personal information for {employee.firstName} {employee.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200 rounded-t-xl">
          <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Employee ID</label>
                <p className="text-gray-900 font-medium mt-1">{employee.empId}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">First Name</label>
                <p className="text-gray-900 mt-1">{employee.firstName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Last Name</label>
                <p className="text-gray-900 mt-1">{employee.lastName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-900 mt-1">{employee.dateOfBirth.toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Gender</label>
                <p className="text-gray-900 mt-1">{employee.gender}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Join Date</label>
                <p className="text-gray-900 mt-1">{employee.joinDate.toLocaleDateString()}</p>
              </div>
              {employee.address && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-gray-900 mt-1">{employee.address}</p>
                </div>
              )}
              {employee.contactInfo && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-600">Contact Info</label>
                  <p className="text-gray-900 mt-1">{employee.contactInfo}</p>
                </div>
              )}
              {employee.teamId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-600">Team ID</label>
                  <p className="text-gray-900 mt-1">{employee.teamId}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 