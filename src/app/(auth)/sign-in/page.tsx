"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { signin } from "@/actions/auth"
import { SigninFormSchema } from "@/lib/definitions"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { LogIn, ArrowLeft, Eye, EyeOff } from "lucide-react"

type SigninFormData = z.infer<typeof SigninFormSchema>

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string>("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(SigninFormSchema),
  })

  const onSubmit = async (data: SigninFormData) => {
    setIsSubmitting(true)
    setServerError("")

    try {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)

      const result = await signin(undefined, formData)

      if (result?.success && result.redirectPath) {
        // Successful authentication - redirect to appropriate dashboard
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
              <LogIn className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-900">Welcome Back!</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Sign in to your Synvibes HRMS account to continue managing your workforce
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
                {errors.email && <p className="text-red-600 text-sm flex items-center gap-1">{errors.email.message}</p>}
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
                    placeholder="Enter your password"
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
                  <p className="text-red-600 text-sm flex items-center gap-1">{errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm text-center">{serverError}</p>
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
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </div>
                )}
              </Button>

              <div className="text-center space-y-3 pt-4">
                <p className="text-gray-600 text-sm">
                  <Link href="/forgot-password" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                    Forgot your password?
                  </Link>
                </p>
                
                <p className="text-gray-600 text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/sign-up" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                    Create one here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Secure login powered by enterprise-grade encryption</p>
        </div>
      </div>
    </div>
  )
}
