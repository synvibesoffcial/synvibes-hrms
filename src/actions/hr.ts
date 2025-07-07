'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';

// Validation schemas
const DepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
});

const TeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
});

type FormState = {
  errors?: {
    name?: string[];
    description?: string[];
    departmentId?: string[];
  };
  message?: string;
  success?: boolean;
};

type AttendanceFormState = {
  errors?: {
    date?: string[];
    checkIn?: string[];
    checkOut?: string[];
  };
  message?: string;
  success?: boolean;
};

// Helper function to check HR authorization
async function checkHRAuthorization() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session?.role !== 'hr') {
    redirect('/sign-in');
  }

  return session as { userId: string; role: string };
}

// Helper function to log system actions
async function logSystemAction(action: string, performedBy: string) {
  await prisma.systemLog.create({
    data: {
      action,
      performedBy,
    },
  });
}

// Department Actions
export async function createDepartment(prevState: FormState, formData: FormData): Promise<FormState & { redirectPath?: string }> {
  const session = await checkHRAuthorization();
  
  const validatedFields = DepartmentSchema.safeParse({
    name: formData.get('name') as string,
    description: formData.get('description') as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Department.',
    };
  }

  const { name, description } = validatedFields.data;

  try {
    // Check if department already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { name },
    });

    if (existingDepartment) {
      return {
        message: 'Department with this name already exists.',
      };
    }

    await prisma.department.create({
      data: {
        name,
        description,
      },
    });

    await logSystemAction(`Created department: ${name}`, session.userId);
    
    revalidatePath('/hr/department-management');
    return {
      success: true,
      message: 'Department created successfully.',
    };
  } catch (error) {
    console.error('Department creation error:', error);
    return {
      message: 'Database Error: Failed to Create Department.',
    };
  }
}

export async function updateDepartment(id: string, prevState: FormState, formData: FormData): Promise<FormState & { redirectPath?: string }> {
  const session = await checkHRAuthorization();
  
  const validatedFields = DepartmentSchema.safeParse({
    name: formData.get('name') as string,
    description: formData.get('description') as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Department.',
    };
  }

  const { name, description } = validatedFields.data;

  try {
    await prisma.department.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    await logSystemAction(`Updated department: ${name}`, session.userId);
    
    revalidatePath('/hr/department-management');
    return {
      success: true,
      message: 'Department updated successfully.',
    };
  } catch (error) {
    console.error('Department update error:', error);
    return {
      message: 'Database Error: Failed to Update Department.',
    };
  }
}

export async function deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
  const session = await checkHRAuthorization();

  try {
    // Check if department has teams
    const teamsCount = await prisma.team.count({
      where: { departmentId: id },
    });

    if (teamsCount > 0) {
      return {
        success: false,
        message: 'Cannot delete department with existing teams. Please reassign or delete teams first.',
      };
    }

    const department = await prisma.department.findUnique({
      where: { id },
      select: { name: true },
    });

    await prisma.department.delete({
      where: { id },
    });

    await logSystemAction(`Deleted department: ${department?.name}`, session.userId);
    
    revalidatePath('/hr/department-management');
    return {
      success: true,
      message: 'Department deleted successfully.',
    };
  } catch (error) {
    console.error('Department deletion error:', error);
    return {
      success: false,
      message: 'Database Error: Failed to Delete Department.',
    };
  }
}

// Team Actions
export async function createTeam(prevState: FormState, formData: FormData): Promise<FormState & { redirectPath?: string }> {
  const session = await checkHRAuthorization();
  
  const validatedFields = TeamSchema.safeParse({
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    departmentId: formData.get('departmentId') as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Team.',
    };
  }

  const { name, description, departmentId } = validatedFields.data;

  try {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { name: true },
    });

    await prisma.team.create({
      data: {
        name,
        description,
        departmentId,
      },
    });

    await logSystemAction(`Created team: ${name} in department: ${department?.name}`, session.userId);
    
    revalidatePath('/hr/team-management');
    return {
      success: true,
      message: 'Team created successfully.',
    };
  } catch (error) {
    console.error('Team creation error:', error);
    return {
      message: 'Database Error: Failed to Create Team.',
    };
  }
}

export async function updateTeam(id: string, prevState: FormState, formData: FormData): Promise<FormState & { redirectPath?: string }> {
  const session = await checkHRAuthorization();
  
  const validatedFields = TeamSchema.safeParse({
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    departmentId: formData.get('departmentId') as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Team.',
    };
  }

  const { name, description, departmentId } = validatedFields.data;

  try {
    await prisma.team.update({
      where: { id },
      data: {
        name,
        description,
        departmentId,
      },
    });

    await logSystemAction(`Updated team: ${name}`, session.userId);
    
    revalidatePath('/hr/team-management');
    return {
      success: true,
      message: 'Team updated successfully.',
    };
  } catch (error) {
    console.error('Team update error:', error);
    return {
      message: 'Database Error: Failed to Update Team.',
    };
  }
}

export async function deleteTeam(id: string): Promise<{ success: boolean; message: string }> {
  const session = await checkHRAuthorization();

  try {
    // Check if team has employees using the junction table
    const employeesCount = await prisma.employeeTeam.count({
      where: { teamId: id },
    });

    if (employeesCount > 0) {
      return {
        success: false,
        message: 'Cannot delete team with assigned employees. Please reassign employees first.',
      };
    }

    const team = await prisma.team.findUnique({
      where: { id },
      select: { name: true },
    });

    await prisma.team.delete({
      where: { id },
    });

    await logSystemAction(`Deleted team: ${team?.name}`, session.userId);
    
    revalidatePath('/hr/team-management');
    return {
      success: true,
      message: 'Team deleted successfully.',
    };
  } catch (error) {
    console.error('Team deletion error:', error);
    return {
      success: false,
      message: 'Database Error: Failed to Delete Team.',
    };
  }
}

// Employee assignment actions
export async function assignEmployeesToTeam(teamId: string, prevState: FormState, formData: FormData): Promise<FormState & { redirectPath?: string }> {
  const session = await checkHRAuthorization();
  
  const employeeIds = formData.getAll('employeeIds') as string[];
  
  if (employeeIds.length === 0) {
    return {
      message: 'No employees selected.',
    };
  }

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { name: true },
    });

    if (!team) {
      return {
        message: 'Team not found.',
      };
    }

    // Create EmployeeTeam relationships for employees not already in this team
    const existingAssignments = await prisma.employeeTeam.findMany({
      where: {
        teamId: teamId,
        employeeId: { in: employeeIds },
      },
      select: { employeeId: true },
    });

    const existingEmployeeIds = existingAssignments.map((ea) => ea.employeeId);
    const newEmployeeIds = employeeIds.filter(id => !existingEmployeeIds.includes(id));

    if (newEmployeeIds.length === 0) {
      return {
        message: 'All selected employees are already assigned to this team.',
      };
    }

    // Create new team assignments
    await prisma.employeeTeam.createMany({
      data: newEmployeeIds.map(employeeId => ({
        employeeId,
        teamId,
      })),
    });

    await logSystemAction(`Assigned ${newEmployeeIds.length} employees to team: ${team.name}`, session.userId);
    
    revalidatePath('/hr/team-management');
    return {
      success: true,
      message: `Successfully assigned ${newEmployeeIds.length} employee(s) to ${team.name}.`,
    };
  } catch (error) {
    console.error('Employee assignment error:', error);
    return {
      message: 'Database Error: Failed to assign employees.',
    };
  }
}

export async function removeEmployeeFromTeam(employeeId: string, teamId: string): Promise<{ success: boolean; message: string }> {
  const session = await checkHRAuthorization();

  try {
    const employeeTeam = await prisma.employeeTeam.findUnique({
      where: {
        employeeId_teamId: {
          employeeId,
          teamId,
        },
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
        team: {
          select: { name: true },
        },
      },
    });

    if (!employeeTeam) {
      return {
        success: false,
        message: 'Employee is not assigned to this team.',
      };
    }

    await prisma.employeeTeam.delete({
      where: {
        employeeId_teamId: {
          employeeId,
          teamId,
        },
      },
    });

    await logSystemAction(
      `Removed ${employeeTeam.employee.firstName} ${employeeTeam.employee.lastName} from team: ${employeeTeam.team.name}`, 
      session.userId
    );
    
    revalidatePath('/hr/team-management');
    return {
      success: true,
      message: 'Employee removed from team successfully.',
    };
  } catch (error) {
    console.error('Employee removal error:', error);
    return {
      success: false,
      message: 'Database Error: Failed to remove employee from team.',
    };
  }
}

// Data fetching functions
export async function getAllDepartments() {
  await checkHRAuthorization();
  
  return await prisma.department.findMany({
    include: {
      teams: {
        include: {
          employees: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  empId: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getAllTeams() {
  await checkHRAuthorization();
  
  return await prisma.team.findMany({
    include: {
      department: true,
      employees: {
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              empId: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getAllEmployees() {
  await checkHRAuthorization();
  
  return await prisma.employee.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      empId: true,
      user: {
        select: {
          email: true,
        },
      },
      teams: {
        include: {
          team: {
            select: {
              name: true,
              department: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      firstName: 'asc',
    },
  });
}

// Employee Profile Management
export async function getEmployeeById(employeeId: string) {
  await checkHRAuthorization();
  
  return await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: true,
      teams: {
        include: {
          team: {
            include: {
              department: true,
            },
          },
        },
      },
      leaves: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      attendance: {
        orderBy: { date: 'desc' },
        take: 30,
      },
      payslips: {
        orderBy: { generatedAt: 'desc' },
        take: 12,
      },
    },
  });
}

// Leave Management
export async function approveLeaveRequest(leaveId: string): Promise<{ success: boolean; message: string }> {
  const session = await checkHRAuthorization();

  try {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { employee: true },
    });

    if (!leave) {
      return { success: false, message: 'Leave request not found.' };
    }

    await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'APPROVED' },
    });

    await logSystemAction(
      `Approved leave request for ${leave.employee.firstName} ${leave.employee.lastName}`,
      session.userId
    );

    revalidatePath('/hr/[id]/leave-approval', 'page');
    return { success: true, message: 'Leave request approved successfully.' };
  } catch (error) {
    console.error('Leave approval error:', error);
    return { success: false, message: 'Failed to approve leave request.' };
  }
}

export async function rejectLeaveRequest(leaveId: string): Promise<{ success: boolean; message: string }> {
  const session = await checkHRAuthorization();

  try {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { employee: true },
    });

    if (!leave) {
      return { success: false, message: 'Leave request not found.' };
    }

    await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'REJECTED' },
    });

    await logSystemAction(
      `Rejected leave request for ${leave.employee.firstName} ${leave.employee.lastName}`,
      session.userId
    );

    revalidatePath('/hr/[id]/leave-approval', 'page');
    return { success: true, message: 'Leave request rejected successfully.' };
  } catch (error) {
    console.error('Leave rejection error:', error);
    return { success: false, message: 'Failed to reject leave request.' };
  }
}

export async function getEmployeeLeaves(employeeId: string) {
  await checkHRAuthorization();
  
  return await prisma.leaveRequest.findMany({
    where: { employeeId },
    include: { employee: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Attendance Management
const AttendanceSchema = z.object({
  date: z.string(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
});

export async function updateAttendance(
  employeeId: string, 
  prevState: AttendanceFormState, 
  formData: FormData
): Promise<AttendanceFormState & { redirectPath?: string }> {
  const session = await checkHRAuthorization();

  const validatedFields = AttendanceSchema.safeParse({
    date: formData.get('date') as string,
    checkIn: formData.get('checkIn') as string,
    checkOut: formData.get('checkOut') as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid attendance data.',
    };
  }

  const { date, checkIn, checkOut } = validatedFields.data;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { firstName: true, lastName: true },
    });

    if (!employee) {
      return { message: 'Employee not found.' };
    }

    // Parse date and times
    const attendanceDate = new Date(date);
    const checkInTime = checkIn ? new Date(`${date}T${checkIn}:00`) : null;
    const checkOutTime = checkOut ? new Date(`${date}T${checkOut}:00`) : null;

    // Check if attendance record exists for this date
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lte: new Date(date + 'T23:59:59.999Z'),
        },
      },
    });

    if (existingAttendance) {
      // Update existing record
      await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkIn: checkInTime,
          checkOut: checkOutTime,
          markedBy: session.userId,
        },
      });
    } else {
      // Create new record
      await prisma.attendance.create({
        data: {
          employeeId,
          date: attendanceDate,
          checkIn: checkInTime,
          checkOut: checkOutTime,
          markedBy: session.userId,
        },
      });
    }

    await logSystemAction(
      `Updated attendance for ${employee.firstName} ${employee.lastName} on ${date}`,
      session.userId
    );

    revalidatePath('/hr/[id]/attendance-log', 'page');
    return { success: true, message: 'Attendance updated successfully.' };
  } catch (error) {
    console.error('Attendance update error:', error);
    return { message: 'Failed to update attendance.' };
  }
}

export async function getEmployeeAttendance(employeeId: string, month?: string, year?: number) {
  await checkHRAuthorization();

  const whereClause: { employeeId: string; date?: { gte: Date; lte: Date } } = { employeeId };

  if (month && year) {
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0);
    whereClause.date = {
      gte: startDate,
      lte: endDate,
    };
  }

  return await prisma.attendance.findMany({
    where: whereClause,
    orderBy: { date: 'desc' },
    take: 100,
  });
}

// Payslip Management
export async function uploadPayslip(
  employeeId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState & { redirectPath?: string }> {
  const session = await checkHRAuthorization();

  const month = formData.get('month') as string;
  const year = parseInt(formData.get('year') as string);
  const file = formData.get('file') as File;

  if (!month || !year || !file) {
    return { message: 'Month, year, and file are required.' };
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { message: 'File size must be less than 10MB.' };
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    return { message: 'Only PDF, JPG, and PNG files are allowed.' };
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { firstName: true, lastName: true, empId: true },
    });

    if (!employee) {
      return { message: 'Employee not found.' };
    }

    // Check if payslip already exists for this month/year
    const existingPayslip = await prisma.payslip.findFirst({
      where: { employeeId, month, year },
    });

    if (existingPayslip) {
      return { message: 'Payslip for this month/year already exists.' };
    }

    // Generate file name and save path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const fileName = `${employee.empId}_${month}_${year}_${timestamp}.${fileExtension}`;
    const fileUrl = `/payslips/${fileName}`;
    
    // Create payslips directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'payslips');
    
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadsDir, fileName);
      
      fs.writeFileSync(filePath, buffer);
    } catch (fileError) {
      console.error('File operation error:', fileError);
      return { message: 'Failed to save file. Please try again.' };
    }

    // Save to database
    await prisma.payslip.create({
      data: {
        employeeId,
        month,
        year,
        fileUrl,
      },
    });

    await logSystemAction(
      `Uploaded payslip for ${employee.firstName} ${employee.lastName} - ${month} ${year}`,
      session.userId
    );

    revalidatePath('/hr/[id]/payslip-upload', 'page');
    return { success: true, message: 'Payslip uploaded successfully.' };
  } catch (error) {
    console.error('Payslip upload error:', error);
    return { message: 'Failed to upload payslip.' };
  }
}

export async function getEmployeePayslips(employeeId: string) {
  await checkHRAuthorization();
  
  return await prisma.payslip.findMany({
    where: { employeeId },
    orderBy: { generatedAt: 'desc' },
  });
}

// HR Dashboard Statistics
export async function getHRDashboardStats() {
  await checkHRAuthorization();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalEmployees,
    presentToday,
    pendingLeaves,
    newHires,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        checkIn: {
          not: null,
        },
      },
    }),
    prisma.leaveRequest.count({
      where: {
        status: 'PENDING',
      },
    }),
    prisma.employee.count({
      where: {
        joinDate: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
    }),
  ]);

  return {
    totalEmployees,
    presentToday,
    pendingLeaves,
    newHires,
  };
} 