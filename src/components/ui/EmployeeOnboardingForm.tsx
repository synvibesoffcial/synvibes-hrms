"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createEmployee } from "@/actions/employee"
import { Input } from "./input"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Badge } from "./badge"
import { useState } from "react"
import { useRouter } from "next/navigation"

import type { User } from "@prisma/client"
import { UserPlus, User as UserIcon, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react"

// Employee validation schema for the form
const EmployeeSchema = z.object({
  empId: z.string().min(1, 'Employee ID is required'),
  designation: z.string().min(1, 'Designation is required'),
  joinDate: z.string().min(1, 'Join date is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  address: z.string().optional(),
  contactInfo: z.string().optional(),
}).refine((data) => {
  const joinDate = new Date(data.joinDate);
  const birthDate = new Date(data.dateOfBirth);
  const today = new Date();
  
  // Check if birth date is before today
  if (birthDate >= today) {
    return false;
  }
  
  // Check if join date is not too far in the future (e.g., within 1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (joinDate > oneYearFromNow) {
    return false;
  }
  
  // Check if employee is at least 16 years old on join date
  const minAge = new Date(birthDate);
  minAge.setFullYear(minAge.getFullYear() + 16);
  if (joinDate < minAge) {
    return false;
  }
  
  return true;
}, {
  message: 'Please check the dates: birth date must be in the past, employee must be at least 16 years old on join date, and join date cannot be more than 1 year in the future',
  path: ['dateOfBirth'],
});

type EmployeeFormData = z.infer<typeof EmployeeSchema>;

export default function EmployeeOnboardingForm({ user }: { user: User }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: {
      empId: `SYN${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`, // Auto-generate employee ID
      designation: "",
      joinDate: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      contactInfo: "",
    }
  })

  const selectedGender = watch("gender")

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true)
    setServerMessage(null)

    try {
      const formData = new FormData()
      formData.append("empId", data.empId)
      formData.append("designation", data.designation)
      formData.append("joinDate", data.joinDate)
      formData.append("dateOfBirth", data.dateOfBirth)
      formData.append("gender", data.gender)
      formData.append("address", data.address || "")
      formData.append("contactInfo", data.contactInfo || "")

      const result = await createEmployee(user, {}, formData)
      
      if (result?.success && result.redirectPath) {
        setServerMessage({ text: result.message || 'Employee profile created successfully!', type: 'success' })
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(result.redirectPath!)
        }, 1500)
      } else if (result?.message) {
        setServerMessage({ text: result.message, type: 'error' })
      }
    } catch {
      setServerMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-4xl border-green-200 shadow-lg">
        <CardHeader className="text-center border-green-200 pb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">Complete Your Profile</CardTitle>
          <p className="text-gray-600 mt-2">
            Just a few more details to get you started
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-900 mb-2">Welcome to Synvibes HRMS!</h3>
            <div className="space-y-1 text-sm text-green-700">
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> <Badge className="bg-green-100 text-green-800">{user.role}</Badge></p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Employee Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="empId" className="text-sm font-medium text-gray-700">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register("empId")}
                    id="empId"
                    placeholder="Enter your employee ID"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    disabled={isSubmitting}
                    readOnly
                  />
                  {errors.empId && (
                    <p className="text-red-500 text-sm">{errors.empId.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="designation" className="text-sm font-medium text-gray-700">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register("designation")}
                    id="designation"
                    type="text"
                    placeholder="e.g. Software Engineer, HR Manager"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    disabled={isSubmitting}
                  />
                  {errors.designation && (
                    <p className="text-red-500 text-sm">{errors.designation.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="joinDate" className="text-sm font-medium text-gray-700">
                    Join Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register("joinDate")}
                    id="joinDate"
                    type="date"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    disabled={isSubmitting}
                  />
                  {errors.joinDate && (
                    <p className="text-red-500 text-sm">{errors.joinDate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <Input
                    {...register("dateOfBirth")}
                    id="dateOfBirth"
                    type="date"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    disabled={isSubmitting}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedGender || ""}
                  onValueChange={(value) => setValue("gender", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm">{errors.gender.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Contact Information
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <Input
                    {...register("address")}
                    id="address"
                    type="text"
                    placeholder="Enter your address"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    disabled={isSubmitting}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm">{errors.address.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contactInfo" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <Input
                    {...register("contactInfo")}
                    id="contactInfo"
                    type="tel"
                    placeholder="Enter your phone number"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                    disabled={isSubmitting}
                  />
                  {errors.contactInfo && (
                    <p className="text-red-500 text-sm">{errors.contactInfo.message}</p>
                  )}
                </div>
              </div>
            </div>

            {serverMessage && (
              <div className={`flex items-center gap-2 p-3 border rounded-lg ${
                serverMessage.type === 'success'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                {serverMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{serverMessage.text}</span>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              {/* <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/employee/")}
                disabled={isSubmitting}
                className="flex-1 border-gray-300"
              >
                Skip for Now
              </Button> */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-md text-yellow-500">
              You cannot proceed to the dashboard until you complete the onboarding process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
