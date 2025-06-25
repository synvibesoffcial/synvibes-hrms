import { verifySession } from "@/lib/dal"
import { redirect } from "next/navigation"
import type { Role } from "@/generated/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, User } from "lucide-react"

type SessionPayload = { userId: string; role: Role | null }

export default async function UserPage() {
  const session = (await verifySession()) as SessionPayload | null

  if (!session?.userId) {
    redirect("/sign-in")
  }

  // Middleware ensures users with roles are redirected, so this page is only for users with no role
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md border-purple-200 shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-200">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl text-purple-900">Account Pending</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Waiting for Role Assignment</h2>
            <p className="text-gray-600 leading-relaxed">
              Your account has been created successfully. Please wait while an administrator assigns your role and
              permissions.
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-purple-700">
              <strong>What happens next?</strong>
              <br />
              An administrator will review your account and assign the appropriate role based on your position in the
              organization.
            </p>
          </div>

          <div className="text-sm text-gray-500">
            You can safely log out and check back later, or contact your administrator for assistance.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
