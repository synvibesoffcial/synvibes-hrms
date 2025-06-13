"use server";

import prisma from "@/lib/db";
// import { auth } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
export async function getEmployees() {
  try {
    // const { userId } = auth();
    // if (!userId) throw new Error("Unauthorized");

    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }
    const employees = await prisma.employee.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return { data: employees, error: null };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { data: null, error: "Failed to fetch employees" };
  }
}

export async function getEmployeeById(id: string) {
  try {
const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        leaves: true,
        attendance: true,
        payslips: true,
      },
    });

    if (!employee) {
      return { data: null, error: "Employee not found" };
    }

    return { data: employee, error: null };
  } catch (error) {
    console.error("Error fetching employee:", error);
    return { data: null, error: "Failed to fetch employee" };
  }
} 