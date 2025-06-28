"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getInvitationByToken, acceptInvitation } from "@/actions/invitations";
import { AcceptInvitationFormSchema, type AcceptInvitationFormData } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, User, AlertCircle, Loader2, CheckCircle } from "lucide-react";

interface InvitationData {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  expiresAt: Date;
}

export default function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(AcceptInvitationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, formState: { errors, isSubmitting }, setError: setFormError, watch } = form;
  const watchedPassword = watch("password");

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    const validateInvitation = async () => {
      try {
        const result = await getInvitationByToken(token);
        if (result.success && result.invitation) {
          setInvitation(result.invitation);
        } else {
          setError(result.error || "Invalid invitation");
        }
      } catch {
        setError("Failed to validate invitation");
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, [token]);

  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!token) {
      setFormError("root", { message: "Invalid invitation token" });
      return;
    }

    try {
      const result = await acceptInvitation(token, {
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      });

      if (result.success) {
        setIsSubmitted(true);
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(result.redirectPath || `/employee`);
        }, 2000);
      } else {
        setFormError("root", { message: result.error || "Failed to create account" });
      }
    } catch {
      setFormError("root", { message: "An unexpected error occurred" });
    }
  };

  if (loading) {
    return (
      <Card className="border-blue-200 shadow-lg">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Validating invitation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Invalid Invitation</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!invitation) {
    return null;
  }

  if (isSubmitted) {
    return (
      <Card className="border-green-200 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-xl font-semibold text-green-800 mb-2">Account Created Successfully!</h2>
            <p className="text-green-600 mb-4">Redirecting you to complete your profile...</p>
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-green-600" />
              <span className="text-sm text-green-600">Please wait...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 shadow-lg">
      <CardHeader className="text-center border-blue-200 pb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl text-blue-900">Complete Your Registration</CardTitle>
        <p className="text-gray-600 mt-2">
          You&apos;ve been invited to join Synvibes HRMS
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Invitation Details */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-3">Invitation Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{invitation.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                {invitation.role}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Invited by:</span>
              <span className="font-medium">{invitation.invitedBy}</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                {...form.register("firstName")}
                className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.firstName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                {...form.register("lastName")}
                className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${
                  errors.lastName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              {...form.register("password")}
              className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${
                errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
            {watchedPassword && watchedPassword.length > 0 && (
              <div className="text-xs text-gray-600 mt-1">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li className={watchedPassword.length >= 8 ? "text-green-600" : "text-red-600"}>
                    At least 8 characters
                  </li>
                  <li className={/(?=.*[a-z])/.test(watchedPassword) ? "text-green-600" : "text-red-600"}>
                    One lowercase letter
                  </li>
                  <li className={/(?=.*[A-Z])/.test(watchedPassword) ? "text-green-600" : "text-red-600"}>
                    One uppercase letter
                  </li>
                  <li className={/(?=.*\d)/.test(watchedPassword) ? "text-green-600" : "text-red-600"}>
                    One number
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...form.register("confirmPassword")}
              className={`border-blue-200 focus:border-blue-500 focus:ring-blue-500 ${
                errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
              }`}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errors.root.message}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 