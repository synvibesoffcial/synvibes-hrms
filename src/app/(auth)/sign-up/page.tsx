"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { signup } from "@/actions/auth"
import { SignupFormSchema } from "@/lib/definitions"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { UserPlus, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"

type SignupFormData = z.infer<typeof SignupFormSchema>

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
  })

  const password = watch("password", "")

  // Password validation helpers
  const passwordChecks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  }

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true)
    setServerError("")

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("email", data.email)
      formData.append("password", data.password)

      const result = await signup(undefined, formData)

      if (result?.success && result.redirectPath) {
        // Successful registration - redirect to user dashboard
        router.push(result.redirectPath)
      } else if (result?.message) {
        setServerError(result.message)
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <Card className="border-purple-200 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-200 rounded-t-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-900">Join Synvibes HRMS</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Create your account and start streamlining your HR management today
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  {...register("name")}
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-600 text-sm flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                    <XCircle className="w-4 h-4" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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

                {/* Password Requirements */}
                {password && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        className={`flex items-center gap-1 ${passwordChecks.length ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordChecks.length ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        8+ characters
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordChecks.letter ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordChecks.letter ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        One letter
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordChecks.number ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordChecks.number ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        One number
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordChecks.special ? "text-green-600" : "text-gray-500"}`}
                      >
                        {passwordChecks.special ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Special char
                      </div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm font-medium mb-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Password Requirements Not Met:
                    </p>
                    <ul className="text-red-600 text-xs space-y-1 ml-5">
                      {errors.password.message
                        ?.split(".")
                        .filter((msg) => msg.trim())
                        .map((error, index) => (
                          <li key={index} className="list-disc">
                            {error.trim()}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm text-center flex items-center justify-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {serverError}
                  </p>
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
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </div>
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-gray-600 text-sm">
                  Already have an account?{" "}
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
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
