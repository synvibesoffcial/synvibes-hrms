import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export default async function EmpDashboard() {
  const user = await currentUser();
  if (!user) return redirect("/");

  // Get employee record
  const employee = await prisma.employee.findUnique({
    where: { userId: user.id },
    include: {
      leaves: true,
      attendance: true,
      payslips: true,
    },
  });

  if (!employee) {
    // Should not happen if onboarding is enforced
    return <div>No employee record found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Employee Dashboard</h1>
    </div>
  );
}