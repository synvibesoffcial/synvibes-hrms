'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { User } from '@/generated/prisma/index.d';

const EmployeeSchema = z.object({
  empId: z.string(),
  joinDate: z.string(),
  dateOfBirth: z.string(),
  gender: z.string(),
  address: z.string().optional(),
  contactInfo: z.string().optional(),
});

type FormState = {
  errors?: {
    empId?: string[];
    joinDate?: string[];
    dateOfBirth?: string[];
    gender?: string[];
    address?: string[];
    contactInfo?: string[];
  };
  message?: string;
};

export async function createEmployee(user: User, prevState: FormState, formData: FormData) {
  const validatedFields = EmployeeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Employee.',
    };
  }
  
  const { empId, joinDate, dateOfBirth, gender, address, contactInfo } = validatedFields.data;

  try {
    await prisma.employee.create({
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        empId,
        joinDate: new Date(joinDate),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        address,
        contactInfo,
      },
    });
  } catch {
    return {
      message: 'Database Error: Failed to Create Employee.',
    };
  }

  revalidatePath('/employee');
  redirect('/employee/dashboard');
}
