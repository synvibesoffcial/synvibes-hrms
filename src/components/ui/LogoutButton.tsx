"use client"
import { useTransition } from "react"
import { logout } from "@/actions/auth"
import { Button } from "./button"

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      variant="outline"
      className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 disabled:opacity-50"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
    >
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  )
}
