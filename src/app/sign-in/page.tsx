'use client';
import { useActionState } from "react";
import { signin } from "@/actions/auth";
import type { FormState } from "@/lib/definitions";

export default function SignInPage() {
  const [signinState, signinAction, signinPending] = useActionState<FormState, FormData>(signin, undefined);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <form className="flex flex-col gap-2 bg-white p-6 rounded shadow w-80 mt-4" action={signinAction}>
        <h2 className="text-xl font-semibold mb-2">Sign In</h2>
        <input className="border p-2 rounded" name="email" type="email" placeholder="Email" required />
        {signinState?.errors?.email && <p className="text-red-600 text-xs">{signinState.errors.email.join(', ')}</p>}
        <input className="border p-2 rounded" name="password" type="password" placeholder="Password" required />
        {signinState?.errors?.password && <p className="text-red-600 text-xs">{signinState.errors.password.join(', ')}</p>}
        {signinState?.message && <p className="text-red-600 text-xs">{signinState.message}</p>}
        <div className="flex gap-2 mt-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex-1" type="submit" disabled={signinPending}>Sign In</button>
        </div>
      </form>
    </div>
  );
} 