"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { forgotPassword } from "@/actions/auth"

const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [serverMessage, setServerMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    // getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    setServerMessage("")

    try {
      const result = await forgotPassword(data.email)
      
      setServerMessage(result.message)
      setIsSuccess(result.success)
    } catch {
      setServerMessage("An unexpected error occurred. Please try again.")
      setIsSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to Sign In Link */}
          <div className="mb-6">
            <Link href="/sign-in" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>

          <Card className="border-purple-200 shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-green-50 to-green-100/50 border-b border-green-200 rounded-t-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-900">Check Your Email!</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Password reset instructions have been sent
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm text-center">
                    {serverMessage}
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">What&apos;s next?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      Check your email inbox (and spam/junk folder)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      Click the password reset link in the email
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      Create a new strong password
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                      Sign in with your new password
                    </li>
                  </ul>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-gray-600 text-sm">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button 
                      onClick={() => {
                        setIsSuccess(false)
                        setServerMessage("")
                      }}
                      className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
                    >
                      try again
                    </button>
                  </p>
                  
                  <Link href="/sign-in">
                    <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Password reset links expire after 1 hour for security
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Sign In Link */}
        <div className="mb-6">
          <Link href="/sign-in" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        <Card className="border-purple-200 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-200 rounded-t-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-900">Forgot Password?</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              No worries! Enter your email and we&apos;ll send you reset instructions
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {serverMessage && !isSuccess && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm text-center">{serverMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-base font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Send Reset Link
                  </div>
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-gray-600 text-sm">
                  Remember your password?{" "}
                  <Link href="/sign-in" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            We&apos;ll send reset instructions to your registered email address
          </p>
        </div>
      </div>
    </div>
  )
} 