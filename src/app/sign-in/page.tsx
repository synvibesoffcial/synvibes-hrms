'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signin } from "@/actions/auth";
import { SigninFormSchema } from "@/lib/definitions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SigninFormData = z.infer<typeof SigninFormSchema>;

export default function SignInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(SigninFormSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await signin(undefined, formData);
      
      if (result?.success && result.redirectPath) {
        // Successful authentication - redirect to appropriate dashboard
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
        <h2 className="text-xl font-semibold mb-2 text-center">Sign In</h2>
        
        <div className="space-y-2">
          <Input
            {...register("email")}
            type="email"
            placeholder="Email"
            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
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
            className="border-gray-300 focus:border-green-500 focus:ring-green-500"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-red-600 text-xs">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-red-600 text-xs text-center">{serverError}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700 text-white transition mt-4"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
} 