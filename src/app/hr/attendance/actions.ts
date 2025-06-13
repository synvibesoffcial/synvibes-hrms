"use server";

import prisma from "@/lib/db";
// import { auth } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function getAttendanceRecords(date: Date) {
  try {
    // const { userId } = auth();
    // if (!userId) throw new Error("Unauthorized");
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return { data: records, error: null };
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    return { data: null, error: "Failed to fetch attendance records" };
  }
}

export async function markAttendance(employeeId: string, date: Date, checkIn: Date, checkOut: Date) {
  try {
const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const record = await prisma.attendance.create({
      data: {
        employeeId,
        date,
        checkIn,
        checkOut,
        markedBy: "hr",
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        action: `Attendance marked for ${record.employee.user.firstName} ${record.employee.user.lastName}`,
        performedBy: userId,
      },
    });

    return { data: record, error: null };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return { data: null, error: "Failed to mark attendance" };
  }
} 