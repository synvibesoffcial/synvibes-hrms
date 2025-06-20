"use client";
import { useTransition } from "react";
import { logout } from "@/actions/auth";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
} 