'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

import type { User } from '@prisma/client';
import { verifySession } from "@/lib/dal";
import type { EmployeeOnboardingData } from "@/types/employee";

// Employee validation schema - moved inline since we can't export non-async values
const EmployeeSchema = z.object({
  empId: z.string().min(1, 'Employee ID is required'),
  designation: z.string().min(1, 'Designation is required'),
  joinDate: z.string().min(1, 'Join date is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  address: z.string().optional(),
  contactInfo: z.string().optional(),
}).refine((data) => {
  const joinDate = new Date(data.joinDate);
  const birthDate = new Date(data.dateOfBirth);
  const today = new Date();
  
  // Check if birth date is before today
  if (birthDate >= today) {
    return false;
  }
  
  // Check if join date is not too far in the future (e.g., within 1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (joinDate > oneYearFromNow) {
    return false;
  }
  
  // Check if employee is at least 16 years old on join date
  const minAge = new Date(birthDate);
  minAge.setFullYear(minAge.getFullYear() + 16);
  if (joinDate < minAge) {
    return false;
  }
  
  return true;
}, {
  message: 'Please check the dates: birth date must be in the past, employee must be at least 16 years old on join date, and join date cannot be more than 1 year in the future',
  path: ['dateOfBirth'],
});

type FormState = {
  errors?: {
    empId?: string[];
    designation?: string[];
    joinDate?: string[];
    dateOfBirth?: string[];
    gender?: string[];
    address?: string[];
    contactInfo?: string[];
  };
  message?: string;
  success?: boolean;
  redirectPath?: string;
};

export async function createEmployee(user: User, prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = EmployeeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Employee.',
    };
  }
  
  const { empId, designation, joinDate, dateOfBirth, gender, address, contactInfo } = validatedFields.data;

  try {
    // Check if empId already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { empId }
    });

    if (existingEmployee) {
      return {
        message: 'Employee ID already exists. Please use a different ID.',
      };
    }

    await prisma.employee.create({
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        empId,
        designation,
        joinDate: new Date(joinDate),
        dateOfBirth: new Date(dateOfBirth),
        gender,
        address: address || null,
        contactInfo: contactInfo || null,
      },
    });

    revalidatePath('/employee');
    return {
      message: 'Employee profile created successfully!',
      success: true,
      redirectPath: '/employee/',
    };
  } catch {
    return {
      message: 'Database Error: Failed to Create Employee.',
    };
  }
}

export async function getEmployeeProfile(userId: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        },
        teams: {
          include: {
            team: {
              select: {
                name: true,
                department: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return employee;
  } catch (error) {
    console.error("Error fetching employee profile:", error);
    return null;
  }
}

export async function updateEmployeeProfile(
  userId: string,
  updates: Partial<EmployeeOnboardingData>
) {
  try {
    const session = await verifySession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user owns this profile or has admin rights
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { role: true }
    });

    const isOwner = session.userId === userId;
    const isAdmin = user?.role && ['admin', 'superadmin', 'hr'].includes(user.role);

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Separate updates for User and Employee tables
    const userUpdateData: Record<string, string> = {};
    const employeeUpdateData: Record<string, string | Date | null> = {};
    
    if (updates.firstName) userUpdateData.firstName = updates.firstName;
    if (updates.lastName) userUpdateData.lastName = updates.lastName;
    
    if (updates.designation) employeeUpdateData.designation = updates.designation;
    if (updates.joinDate) employeeUpdateData.joinDate = new Date(updates.joinDate);
    if (updates.dateOfBirth) employeeUpdateData.dateOfBirth = new Date(updates.dateOfBirth);
    if (updates.gender) employeeUpdateData.gender = updates.gender;
    if (updates.address !== undefined) employeeUpdateData.address = updates.address || null;
    if (updates.contactInfo !== undefined) employeeUpdateData.contactInfo = updates.contactInfo || null;

    // Update User table if needed
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData
      });
    }

    // Update Employee table
    const employee = await prisma.employee.update({
      where: { userId },
      data: employeeUpdateData
    });

    revalidatePath('/employee/profileSection');
    revalidatePath('/employee/');

    return { 
      success: true, 
      message: "Employee profile updated successfully",
      employee
    };
  } catch (error) {
    console.error("Error updating employee profile:", error);
    return { success: false, error: "Failed to update employee profile" };
  }
}
