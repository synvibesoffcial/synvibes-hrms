'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { LeaveRequestSchema, type FormState } from './schemas';

export async function getEmployeeLeaves(employeeId: string) {
  const leaves = await prisma.leaveRequest.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' }
  });
  return leaves;
}

export async function getEmployeeAttendance(employeeId: string) {
  const attendance = await prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { date: 'desc' },
    take: 30 // Last 30 attendance records
  });
  return attendance;
}

export async function getEmployeePayslips(employeeId: string) {
  const payslips = await prisma.payslip.findMany({
    where: { employeeId },
    orderBy: { generatedAt: 'desc' }
  });
  return payslips;
}

// Schema and types imported from schemas.ts

export async function createLeaveRequest(employeeId: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = LeaveRequestSchema.safeParse({
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    reason: formData.get('reason'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please fill in all required fields.',
    };
  }

  const { startDate, endDate, reason } = validatedFields.data;

  try {
    await prisma.leaveRequest.create({
      data: {
        employeeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: 'PENDING',
      },
    });

    revalidatePath('/employee/leaveSection');
    return { 
      message: 'Leave request submitted successfully!',
      success: true,
    };
  } catch {
    return { message: 'Failed to submit leave request. Please try again.' };
  }
}

export async function markAttendance(
  employeeId: string,
  type: "checkin" | "checkout",
  location?: { latitude: number; longitude: number }
) {
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
        checkInLatitude: location?.latitude,
        checkInLongitude: location?.longitude,
        markedBy: "self",
      },
    });
  } else if (type === "checkout" && attendance && !attendance.checkOut) {
    await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: today,
        checkOutLatitude: location?.latitude,
        checkOutLongitude: location?.longitude,
      },
    });
  }
}



export async function getTodayAttendance(employeeId: string) {
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

  return attendance;
} 