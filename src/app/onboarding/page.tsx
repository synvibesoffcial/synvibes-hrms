import { Suspense } from "react";
import OnboardingForm from "./OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Suspense fallback={<div>Loading...</div>}>
          <OnboardingForm />
        </Suspense>
      </div>
    </div>
  );
} 