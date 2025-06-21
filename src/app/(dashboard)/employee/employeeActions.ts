'use server';

import prisma from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

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

const LeaveRequestSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(1, 'Reason is required'),
});

type FormState = {
  errors?: {
    startDate?: string[];
    endDate?: string[];
    reason?: string[];
  };
  message?: string;
};

export async function createLeaveRequest(employeeId: string, prevState: FormState, formData: FormData) {
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

    revalidatePath('/employee/dashboard');
    return { message: 'Leave request submitted successfully!' };
  } catch {
    return { message: 'Failed to submit leave request. Please try again.' };
  }
}

export async function checkIn(employeeId: string, latitude?: number, longitude?: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's already an attendance record for today
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (existingAttendance) {
      if (existingAttendance.checkIn) {
        return { message: 'You have already checked in today.' };
      }
      
      // Update existing record with check-in
      await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkIn: new Date(),
          checkInLatitude: latitude,
          checkInLongitude: longitude,
        },
      });
    } else {
      // Create new attendance record
      await prisma.attendance.create({
        data: {
          employeeId,
          date: new Date(),
          checkIn: new Date(),
          checkInLatitude: latitude,
          checkInLongitude: longitude,
          markedBy: employeeId,
        },
      });
    }

    revalidatePath('/employee/dashboard');
    return { message: 'Checked in successfully!' };
  } catch {
    return { message: 'Failed to check in. Please try again.' };
  }
}

export async function checkOut(employeeId: string, latitude?: number, longitude?: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (!existingAttendance) {
      return { message: 'No check-in record found for today. Please check in first.' };
    }

    if (existingAttendance.checkOut) {
      return { message: 'You have already checked out today.' };
    }

    // Update with check-out
    await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        checkOut: new Date(),
        checkOutLatitude: latitude,
        checkOutLongitude: longitude,
      },
    });

    revalidatePath('/employee/dashboard');
    return { message: 'Checked out successfully!' };
  } catch {
    return { message: 'Failed to check out. Please try again.' };
  }
}

export async function getTodayAttendance(employeeId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: {
      employeeId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  return attendance;
} 