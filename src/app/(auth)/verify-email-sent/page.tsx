"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { resendVerificationEmail } from "@/actions/auth"

function VerifyEmailSentContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [resendSuccess, setResendSuccess] = useState(false)

  // Pre-populate email from query params
  useEffect(() => {
    const emailFromQuery = searchParams.get('email')
    if (emailFromQuery) {
      setEmail(decodeURIComponent(emailFromQuery))
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    if (!email) {
      setResendMessage("Please enter your email address")
      setResendSuccess(false)
      return
    }

    setIsResending(true)
    setResendMessage("")

    try {
      const result = await resendVerificationEmail(email)
      setResendMessage(result.message)
      setResendSuccess(result.success)
    } catch {
      setResendMessage("An unexpected error occurred. Please try again.")
      setResendSuccess(false)
    } finally {
      setIsResending(false)
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
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-purple-900">Check Your Email!</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              We&apos;ve sent a verification link to your email address
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">Account Created Successfully!</p>
                </div>
                <p className="text-green-600 text-sm mt-1">
                  Please check your email and click the verification link to activate your account.
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
                    Click the verification link in the email
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    Start using Synvibes HRMS once granted role by admin
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2 text-amber-800">
                  <span className="text-amber-600 text-lg">⚠️</span>
                  <div className="space-y-2">
                    <p className="font-medium">If you didn&apos;t receive the email:</p>
                    <ul className="text-sm space-y-1 text-amber-700">
                      <li>• The email address you entered might be incorrect. You can{" "}
                        <Link href="/sign-up" className="text-amber-600 hover:text-amber-800 font-medium underline">
                          go back to sign up
                        </Link>{" "}
                        and try again with the correct email address.
                      </li>
                      <li>• If your email address was correct and you still didn&apos;t receive the email, please contact us at{" "}
                        <a href="mailto:info@synvibes.com" className="text-amber-600 hover:text-amber-800 font-medium underline">
                          info@synvibes.com
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-3">Didn&apos;t receive the email?</h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label htmlFor="resend-email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <Input
                      id="resend-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>

                  {resendMessage && (
                    <div className={`border rounded-lg p-3 ${
                      resendSuccess 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      <p className="text-sm">{resendMessage}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    variant="outline"
                  >
                    {isResending ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        Resend Verification Email
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-gray-600 text-sm">
                  Already verified your email?{" "}
                  <Link href="/sign-in" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Verification links expire after 24 hours for security
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailSentPage() {
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
      <VerifyEmailSentContent />
    </Suspense>
  )
} 