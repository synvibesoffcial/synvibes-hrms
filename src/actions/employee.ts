'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

import type { User } from '@prisma/client';
import { verifySession, getUserById } from "@/lib/dal";
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
      redirectPath: '/employee/dashboard',
    };
  } catch {
    return {
      message: 'Database Error: Failed to Create Employee.',
    };
  }
}

export async function createEmployeeProfile(
  userId: string,
  data: EmployeeOnboardingData
) {
  try {
    // For onboarding, we're more lenient with session verification
    const session = await verifySession();
    
    // Check if user exists first
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true
      }
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // If there's no session, but user exists and has no employee profile, allow creation
    // This handles the onboarding flow after invitation acceptance
    if (!session) {
      // Only allow if user doesn't have an employee profile yet
      if (user.employee) {
        return { success: false, error: "Employee profile already exists" };
      }
      // Continue with profile creation for new users
    } else {
      // If session exists, verify the user is creating their own profile or has admin rights
      if (session.userId !== userId) {
        const currentUser = await prisma.user.findUnique({
          where: { id: session.userId as string },
          select: { role: true }
        });

        if (!currentUser || !['admin', 'superadmin', 'hr'].includes(currentUser.role || '')) {
          return { success: false, error: "Insufficient permissions" };
        }
      }
    }

    // Additional check for employee profile (already checked above in user query)
    if (user.employee) {
      return { success: false, error: "Employee profile already exists" };
    }

    // Check if empId is unique
    const existingEmpId = await prisma.employee.findUnique({
      where: { empId: data.empId }
    });

    if (existingEmpId) {
      return { success: false, error: "Employee ID already exists" };
    }

    // Create employee profile
    const employee = await prisma.employee.create({
      data: {
        userId,
        empId: data.empId,
        firstName: user.firstName,
        lastName: user.lastName,
        designation: data.designation,
        joinDate: new Date(data.joinDate),
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        address: data.address || null,
        contactInfo: data.contactInfo || null,
      }
    });

    return { 
      success: true, 
      message: "Employee profile created successfully",
      employee: {
        id: employee.id,
        empId: employee.empId,
        designation: employee.designation
      }
    };
  } catch (error) {
    console.error("Error creating employee profile:", error);
    return { success: false, error: "Failed to create employee profile" };
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

    const updateData: Record<string, string | Date | null> = {};
    
    if (updates.designation) updateData.designation = updates.designation;
    if (updates.joinDate) updateData.joinDate = new Date(updates.joinDate);
    if (updates.dateOfBirth) updateData.dateOfBirth = new Date(updates.dateOfBirth);
    if (updates.gender) updateData.gender = updates.gender;
    if (updates.address !== undefined) updateData.address = updates.address || null;
    if (updates.contactInfo !== undefined) updateData.contactInfo = updates.contactInfo || null;

    const employee = await prisma.employee.update({
      where: { userId },
      data: updateData
    });

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

export async function getUserForOnboarding(userId: string) {
  try {
    // For onboarding, we're more lenient with session verification
    // The user might have just been created and redirected from invitation acceptance
    const session = await verifySession();
    
    // If no session, we'll still check if the user exists and has no employee profile
    // This allows for onboarding flow after invitation acceptance
    if (!session) {
      // Check if user exists and doesn't have an employee profile yet
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          employee: true
        }
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // If user already has an employee profile, they shouldn't be onboarding
      if (user.employee) {
        return { success: false, error: "User already has a complete profile" };
      }

      // Allow onboarding for new users without employee profiles
      return {
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role || 'employee'
        }
      };
    }

    // If session exists, verify permissions
    if (session.userId !== userId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.userId as string },
        select: { role: true }
      });

      if (!['admin', 'superadmin', 'hr'].includes(currentUser?.role || '')) {
        return { success: false, error: "Insufficient permissions" };
      }
    }

    const user = await getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    return {
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || 'employee'
      }
    };
  } catch (error) {
    console.error("Error fetching user for onboarding:", error);
    return { success: false, error: "Failed to fetch user data" };
  }
}
