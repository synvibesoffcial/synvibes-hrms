'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signup } from "@/actions/auth";
import { SignupFormSchema } from "@/lib/definitions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SignupFormData = z.infer<typeof SignupFormSchema>;

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupFormSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await signup(undefined, formData);
      
      if (result?.success && result.redirectPath) {
        // Successful registration - redirect to user dashboard
        router.push(result.redirectPath);
      } else if (result?.message) {
        setServerError(result.message);
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md w-80 mt-4"
      >
        <h2 className="text-xl font-semibold mb-2 text-center">Sign Up</h2>
        
        <div className="space-y-2">
          <Input
            {...register("name")}
            type="text"
            placeholder="Full Name"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="text-red-600 text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-600 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          {errors.password && (
            <div className="text-red-600 text-xs">
              <p className="font-medium mb-1">Password must:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.password.message?.split('.').filter(msg => msg.trim()).map((error, index) => (
                  <li key={index}>{error.trim()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {serverError && (
          <p className="text-red-600 text-xs text-center">{serverError}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white transition mt-4"
        >
          {isSubmitting ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
} 