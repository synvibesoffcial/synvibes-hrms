"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams, useRouter } from "next/navigation"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { resetPassword } from "@/actions/auth"

const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetState, setResetState] = useState<{
    status: 'form' | 'success' | 'error'
    message: string
  }>({
    status: 'form',
    message: ''
  })

  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  useEffect(() => {
    if (!token) {
      setResetState({
        status: 'error',
        message: 'Invalid password reset link. Please request a new password reset.'
      })
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return

    setIsSubmitting(true)

    try {
      const result = await resetPassword(token, data.password)
      
      setResetState({
        status: result.success ? 'success' : 'error',
        message: result.message
      })

      // If successful, redirect after a delay
      if (result.success && result.redirectPath) {
        setTimeout(() => {
          router.push(result.redirectPath!)
        }, 3000)
      }
    } catch {
      setResetState({
        status: 'error',
        message: "An unexpected error occurred. Please try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success state
  if (resetState.status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/sign-in" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>

          <Card className="border-green-200 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-200 rounded-t-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-900">Password Reset!</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Your password has been successfully updated
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm text-center">
                    {resetState.message}
                  </p>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-gray-600 text-sm">
                    You will be automatically redirected to the sign-in page in a few seconds...
                  </p>
                  
                  <Link href="/sign-in">
                    <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
                      Continue to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (resetState.status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/sign-in" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>

          <Card className="border-red-200 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-red-50 to-red-100/50 border-b border-red-200 rounded-t-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900">Reset Failed</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                There was a problem resetting your password
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm text-center">
                    {resetState.message}
                  </p>
                </div>

                <div className="space-y-3">
                  <Link href="/forgot-password">
                    <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
                      Request New Password Reset
                    </Button>
                  </Link>
                  
                  <Link href="/sign-in">
                    <Button variant="outline" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/sign-in" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        <Card className="border-purple-200 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-200 rounded-t-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-900">Reset Password</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    {...register("confirmPassword")}
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Use a unique password you haven&apos;t used before</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Password...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Update Password
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your new password will be required for all future sign-ins
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-purple-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
} 