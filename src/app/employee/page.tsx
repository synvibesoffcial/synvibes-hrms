import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import EmployeeDetailsForm from "./EmployeeDetailsForm";
import { createEmployee } from "./actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EmployeeProfile from "./EmployeeProfile/page";
import EmployeeCRUD from "./EmployeeCRUD/page";
import LeaveRequestSection from "./LeaveRequestSection/page";
import AttendanceSection from "./AttendanceSection/page";
import PayslipSection from "./PayslipSection/page";

type Role = "admin" | "hr" | "employee";
type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  createdAt: Date;
}

interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn?: Date | null;
  checkOut?: Date | null;
  markedBy: string;
}

interface Payslip {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  fileUrl: string;
  generatedAt: Date;
}

interface Employee {
  id: string;
  userId: string;
  empId: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  joinDate: Date;
  dateOfBirth: Date;
  gender: string;
  address?: string;
  contactInfo?: string;
  leaves: LeaveRequest[];
  attendance: Attendance[];
  payslips: Payslip[];
}

export default async function EmployeePage() {
  const user = await currentUser();
  if (!user) return redirect("/");

  // Get employee record with all sections and new fields
  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    include: {
      leaves: true,
      attendance: true,
      payslips: true,
    },
  }) as Employee | null;

  if (!employee) {
    async function handleSubmit(formData: {
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
      "use server";
      const res = await createEmployee(formData);
      if (res.ok) {
        redirect("/employee");
      }
      // Optionally handle error
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Complete Your Employee Details</h1>
        <EmployeeDetailsForm onSubmit={handleSubmit} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Overview</h1>
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payslips">Payslips</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <EmployeeProfile employee={employee} />
        </TabsContent>
        <TabsContent value="edit">
          <EmployeeCRUD employee={employee} />
        </TabsContent>
        <TabsContent value="leave">
          <LeaveRequestSection employee={employee} />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendanceSection employee={employee} />
        </TabsContent>
        <TabsContent value="payslips">
          <PayslipSection payslips={employee.payslips} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export type { Employee, Attendance, LeaveRequest, Payslip, Role, LeaveStatus };
