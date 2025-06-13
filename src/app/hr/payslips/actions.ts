"use server";

import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function getPayslips(month: string, year: number) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }
    const payslips = await prisma.payslip.findMany({
      where: {
        month,
        year,
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
        generatedAt: "desc",
      },
    });

    return { data: payslips, error: null };
  } catch (error) {
    console.error("Error fetching payslips:", error);
    return { data: null, error: "Failed to fetch payslips" };
  }
}

export async function uploadPayslip(employeeId: string, month: string, year: number, file: File) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return { error: "Invalid file type. Only PDF, JPG, and PNG are allowed." };
    }

    // Get file extension based on type
    let fileExtension;
    switch (file.type) {
      case "application/pdf":
        fileExtension = ".pdf";
        break;
      case "image/jpeg":
        fileExtension = ".jpg";
        break;
      case "image/png":
        fileExtension = ".png";
        break;
      default:
        return { error: "Unsupported file type" };
    }

    // Create a unique filename
    const timestamp = new Date().getTime();
    const filename = `${employeeId}_${month}_${year}_${timestamp}${fileExtension}`;
    const filePath = path.join(process.cwd(), "public", "payslips", filename);

    // Convert File to Buffer and save it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Check if payslip already exists for this employee, month, and year
    const existingPayslip = await prisma.payslip.findFirst({
      where: {
        employeeId,
        month,
        year,
      },
    });

    if (existingPayslip) {
      return { error: `Payslip already exists for ${month} ${year} for this employee.` };
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!employee) {
      return { error: `Employee with ID ${employeeId} not found.` };
    }

    // Create the payslip record in the database
    const payslip = await prisma.payslip.create({
      data: {
        employeeId,
        month,
        year,
        fileUrl: `/payslips/${filename}`,
        generatedAt: new Date(),
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
        action: `Payslip uploaded for ${payslip.employee.user.firstName} ${payslip.employee.user.lastName} (${month} ${year})`,
        performedBy: user.id,
      },
    });

    return { data: payslip, error: null };
  } catch (error: any) {
    console.error("Error uploading payslip:", {
      message: error.message,
      stack: error.stack,
      employeeId,
      month,
      year,
    });
    return { data: null, error: `Failed to upload payslip: ${error.message}` };
  }
}

export async function getEmployees() {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const employees = await prisma.employee.findMany({
      where: {
        user: {
          role: "employee",
        },
      },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Transform to match the expected Employee interface
    const formattedEmployees = employees.map((employee) => ({
      id: employee.id,
      firstName: employee.user.firstName,
      lastName: employee.user.lastName,
      email: employee.user.email,
    }));

    return { data: formattedEmployees, error: null };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { data: null, error: "Failed to fetch employees" };
  }
}