"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { verifyEmail } from "@/actions/auth"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verificationState, setVerificationState] = useState<{
    status: 'loading' | 'success' | 'error'
    message: string
    redirectPath?: string
  }>({
    status: 'loading',
    message: ''
  })

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setVerificationState({
        status: 'error',
        message: 'Invalid verification link. Please check your email and try again.'
      })
      return
    }

    const handleVerification = async () => {
      try {
        const result = await verifyEmail(token)
        
        setVerificationState({
          status: result.success ? 'success' : 'error',
          message: result.message,
          redirectPath: result.redirectPath
        })

        // If successful, redirect after a delay
        if (result.success && result.redirectPath) {
          setTimeout(() => {
            router.push(result.redirectPath!)
          }, 3000)
        }
      } catch {
        setVerificationState({
          status: 'error',
          message: 'An unexpected error occurred during verification. Please try again.'
        })
      }
    }

    handleVerification()
  }, [searchParams, router])

  const handleManualRedirect = () => {
    if (verificationState.redirectPath) {
      router.push(verificationState.redirectPath)
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
              {verificationState.status === 'loading' && (
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
              )}
              {verificationState.status === 'success' && (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
              {verificationState.status === 'error' && (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold text-purple-900">
              {verificationState.status === 'loading' && 'Verifying Email...'}
              {verificationState.status === 'success' && 'Email Verified!'}
              {verificationState.status === 'error' && 'Verification Failed'}
            </CardTitle>
            
            <CardDescription className="text-gray-600 mt-2">
              {verificationState.status === 'loading' && 'Please wait while we verify your email address'}
              {verificationState.status === 'success' && 'Your email has been successfully verified'}
              {verificationState.status === 'error' && 'There was a problem verifying your email'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              {verificationState.status === 'loading' && (
                <div className="text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-700 text-sm">
                      We&apos;re verifying your email address. This should only take a moment...
                    </p>
                  </div>
                </div>
              )}

              {verificationState.status === 'success' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <p className="font-medium">Verification Successful!</p>
                    </div>
                    <p className="text-green-600 text-sm mt-1">
                      {verificationState.message}
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <p className="text-gray-600 text-sm">
                      You will be automatically redirected to your dashboard in a few seconds...
                    </p>
                    
                    {verificationState.redirectPath && (
                      <Button
                        onClick={handleManualRedirect}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Continue to Dashboard
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {verificationState.status === 'error' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-5 h-5" />
                      <p className="font-medium">Verification Failed</p>
                    </div>
                    <p className="text-red-600 text-sm mt-1">
                      {verificationState.message}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-gray-600 text-sm text-center">
                      What you can do:
                    </p>
                    
                    <div className="space-y-2">
                      <Link href="/verify-email-sent">
                        <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50">
                          Request New Verification Email
                        </Button>
                      </Link>
                      
                      <Link href="/sign-up">
                        <Button variant="outline" className="w-full">
                          Create New Account
                        </Button>
                      </Link>
                      
                      <Link href="/sign-in">
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? Contact our support team for assistance
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  )
} 