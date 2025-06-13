"use server";

import prisma from "@/lib/db";
// import { auth } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function getLeaveRequests() {
  try {
    // const { userId } = auth();
    // if (!userId) throw new Error("Unauthorized");
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }
    const leaveRequests = await prisma.leaveRequest.findMany({
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
        createdAt: "desc",
      },
    });

    return { data: leaveRequests, error: null };
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return { data: null, error: "Failed to fetch leave requests" };
  }
}

export async function updateLeaveRequestStatus(requestId: string, status: "APPROVED" | "REJECTED") {
  try {
const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const updatedRequest = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status },
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
        action: `Leave request ${status.toLowerCase()} for ${updatedRequest.employee.user.firstName} ${updatedRequest.employee.user.lastName}`,
        performedBy: user.id, // Assuming user.id is available
      },
    });

    return { data: updatedRequest, error: null };
  } catch (error) {
    console.error("Error updating leave request:", error);
    return { data: null, error: "Failed to update leave request" };
  }
} 