import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import EmployeeDetailsForm from "./EmployeeDetailsForm";
import { createEmployee } from "./actions";

export default async function EmployeePage() {
  const user = await currentUser();
  if (!user) return redirect("/");

  // Check if employee record exists
  const employee = await prisma.employee.findUnique({ where: { userId: user.id } });

  if (employee) {
    redirect("/employee/empdashboard");
  }

  async function handleSubmit(formData: any) {
    "use server";
    const res = await createEmployee(formData);
    if (res.ok) {
      redirect("/employee/empdashboard");
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
