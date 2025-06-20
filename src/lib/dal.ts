import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function verifySession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    const payload = await decrypt(session);
    return payload;
  } catch {
    return null;
  }
} 