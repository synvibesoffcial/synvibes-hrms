"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export async function checkHRAuthorization() {
  try {
    const user = await currentUser();
    if (!user) {
      return { isAuthorized: false };
    }

    const prismaUser = await prisma.user.findUnique({
      where: {
        id: user.id
      },
      select: {
        role: true
      }
    });

    return { isAuthorized: prismaUser?.role === "hr" };
  } catch (error) {
    console.error("Error checking HR authorization:", error);
    return { isAuthorized: false };
  }
} 