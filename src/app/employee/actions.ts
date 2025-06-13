"use server";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function createEmployee(data: {
  department: string;
  position: string;
  joinDate: string;
  contactInfo?: string;
}) {
  const user = await currentUser();
  if (!user) throw new Error("Not authenticated");

  // Check if already exists
  const existing = await prisma.employee.findUnique({ where: { userId: user.id } });
  if (existing) return { ok: false, message: "Already exists" };

  await prisma.employee.create({
    data: {
      userId: user.id,
      department: data.department,
      position: data.position,
      joinDate: new Date(data.joinDate),
      contactInfo: data.contactInfo,
    },
  });

  return { ok: true };
}
