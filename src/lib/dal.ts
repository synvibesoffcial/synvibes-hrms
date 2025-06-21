import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import prisma from "./db";

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

export async function getEmployeeByUserId(userId: string) {
  const employee = await prisma.employee.findUnique({ where: { userId } });
  return employee;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

export async function getUsers() {
  const users = await prisma.user.findMany();
  return users;
} 