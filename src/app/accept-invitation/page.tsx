import { Suspense } from "react";
import AcceptInvitationForm from "./AcceptInvitationForm";

export default function AcceptInvitationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Suspense fallback={<div>Loading...</div>}>
          <AcceptInvitationForm />
        </Suspense>
      </div>
    </div>
  );
} 