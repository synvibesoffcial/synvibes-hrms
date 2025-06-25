"use client"

import { useActionState } from "react"
import { createEmployee } from "@/actions/employee"
import { Input } from "./input"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import type { User } from "@/generated/prisma/index.d"
import { UserPlus } from "lucide-react"

export default function EmployeeOnboardingForm({ user }: { user: User }) {
  const initialState = { message: null, errors: {} }
  const createEmployeeWithUser = createEmployee.bind(null, user)
  const [state, dispatch] = useActionState(createEmployeeWithUser, initialState)

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl border-purple-200 shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-200">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl text-purple-900">Welcome, {user.firstName}!</CardTitle>
          <p className="text-gray-600 mt-2">Please complete your employee profile to get started</p>
        </CardHeader>
        <CardContent className="p-8">
          <form action={dispatch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="empId" className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <Input
                  id="empId"
                  name="empId"
                  placeholder="Enter your employee ID"
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
                {state?.errors?.empId && <p className="text-red-500 text-sm mt-1">{state.errors.empId[0]}</p>}
              </div>

              <div>
                <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Join Date *
                </label>
                <Input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
                {state?.errors?.joinDate && <p className="text-red-500 text-sm mt-1">{state.errors.joinDate[0]}</p>}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
                {state?.errors?.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{state.errors.dateOfBirth[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {state?.errors?.gender && <p className="text-red-500 text-sm mt-1">{state.errors.gender[0]}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Enter your complete address"
                className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              />
              {state?.errors?.address && <p className="text-red-500 text-sm mt-1">{state.errors.address[0]}</p>}
            </div>

            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information
              </label>
              <Input
                id="contactInfo"
                name="contactInfo"
                placeholder="Phone number, alternate email, etc."
                className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              />
              {state?.errors?.contactInfo && <p className="text-red-500 text-sm mt-1">{state.errors.contactInfo[0]}</p>}
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg">
              Complete Profile Setup
            </Button>

            {state?.message && (
              <div className="text-center">
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">{state.message}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
