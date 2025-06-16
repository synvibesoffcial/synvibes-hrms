"use server";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function createEmployee(data: {
  empId: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  joinDate: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
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
      empId: data.empId,
      systemRole: 'employee',
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      position: data.position,
      joinDate: new Date(data.joinDate),
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      address: data.address,
      contactInfo: data.contactInfo,
    },
  });

  return { ok: true };
}

// Update employee
export async function updateEmployee(id: string, data: {
  empId: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  joinDate: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  contactInfo?: string;
}) {
  await prisma.employee.update({
    where: { id },
    data: {
      empId: data.empId,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      position: data.position,
      joinDate: new Date(data.joinDate),
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      address: data.address,
      contactInfo: data.contactInfo,
    },
  });
}

// Delete employee
export async function deleteEmployee(id: string) {
  await prisma.employee.delete({ where: { id } });
}

// Request leave
export async function requestLeave(employeeId: string, data: { startDate: string; endDate: string; reason: string }) {
  await prisma.leaveRequest.create({
    data: {
      employeeId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      reason: data.reason,
    },
  });
}

// Mark attendance
export async function markAttendance(employeeId: string, type: "checkin" | "checkout") {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);

  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: {
        gte: new Date(dateStr + "T00:00:00.000Z"),
        lte: new Date(dateStr + "T23:59:59.999Z"),
      },
    },
  });

  if (type === "checkin" && !attendance) {
    await prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        checkIn: today,
        markedBy: "self",
      },
    });
  } else if (type === "checkout" && attendance && !attendance.checkOut) {
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: today },
    });
  }
}
