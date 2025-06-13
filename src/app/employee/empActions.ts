"use server";
import prisma from "@/lib/db";

// Update employee
export async function updateEmployee(id, data) {
  await prisma.employee.update({
    where: { id },
    data: {
      department: data.department,
      position: data.position,
      joinDate: new Date(data.joinDate),
      contactInfo: data.contactInfo,
    },
  });
}

// Delete employee
export async function deleteEmployee(id) {
  await prisma.employee.delete({ where: { id } });
}

// Request leave
export async function requestLeave(employeeId, data) {
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
export async function markAttendance(employeeId, type) {
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
