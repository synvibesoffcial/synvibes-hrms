import { cookies } from "next/headers"
import { decrypt } from "@/lib/session"
import { getEmployeeByUserId } from "@/lib/dal"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Briefcase, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EditProfileDialog } from "./EditProfileDialog"

// Function to check if profile is complete
function checkProfileCompletion(employee: {
  designation: string | null;
  address: string | null;
  contactInfo: string | null;
}) {
  const missingFields = []
  
  if (!employee.designation) missingFields.push("Designation")
  if (!employee.address) missingFields.push("Address")
  if (!employee.contactInfo) missingFields.push("Contact Information")
  
  return {
    isComplete: missingFields.length === 0,
    missingFields
  }
}

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

  const profileStatus = checkProfileCompletion(employee)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mt-8">
        <Link href="/employee//">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Profile Incomplete Alert */}
      {!profileStatus.isComplete && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Profile Incomplete:</strong> Please complete the following fields: {profileStatus.missingFields.join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="flex items-center justify-between">
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
          <EditProfileDialog employee={employee} />
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
                <label className="text-sm font-medium text-gray-600">Designation</label>
                <p className="text-gray-900 mt-1">
                  {employee.designation || (
                    <span className="text-amber-600 italic">Not specified</span>
                  )}
                </p>
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-900 mt-1">
                  {employee.address || (
                    <span className="text-amber-600 italic">Not specified</span>
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Contact Info</label>
                <p className="text-gray-900 mt-1">
                  {employee.contactInfo || (
                    <span className="text-amber-600 italic">Not specified</span>
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-600">Teams</label>
                <div className="mt-1 space-y-1">
                  {employee.teams && employee.teams.length > 0 ? (
                    employee.teams.map((employeeTeam) => (
                      <div key={employeeTeam.id} className="text-gray-900">
                        {employeeTeam.team.name} ({employeeTeam.team.department.name})
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-600 italic">Not assigned to any team</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 