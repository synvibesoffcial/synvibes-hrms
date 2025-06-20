'use client';
import { useActionState } from "react";
import { signup } from "@/actions/auth";
import type { FormState } from "@/lib/definitions";

export default function SignUpPage() {
  const [signupState, signupAction, signupPending] = useActionState<FormState, FormData>(signup, undefined);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <form className="flex flex-col gap-2 bg-white p-6 rounded shadow w-80 mt-4" action={signupAction}>
        <h2 className="text-xl font-semibold mb-2">Sign Up</h2>
        <input className="border p-2 rounded" name="name" placeholder="Name" required />
        {signupState?.errors?.name && <p className="text-red-600 text-xs">{signupState.errors.name.join(', ')}</p>}
        <input className="border p-2 rounded" name="email" type="email" placeholder="Email" required />
        {signupState?.errors?.email && <p className="text-red-600 text-xs">{signupState.errors.email.join(', ')}</p>}
        <input className="border p-2 rounded" name="password" type="password" placeholder="Password" required />
        {signupState?.errors?.password && (
          <div className="text-red-600 text-xs">
            <p>Password must:</p>
            <ul>
              {signupState.errors.password.map((error) => (
                <li key={error}>- {error}</li>
              ))}
            </ul>
          </div>
        )}
        {signupState?.message && <p className="text-red-600 text-xs">{signupState.message}</p>}
        <div className="flex gap-2 mt-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex-1" type="submit" disabled={signupPending}>Sign Up</button>
        </div>
      </form>
    </div>
  );
} 