"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { checkHRAuthorization } from "./actions";

import EmployeesPage from "./employees/page";
import AttendancePage from "./attendance/page";
import LeavesPage from "./leaves/page";
import PayslipsPage from "./payslips/page";

export default function HRDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const { isAuthorized } = await checkHRAuthorization();
        if (!isAuthorized) {
          router.push("/");
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking authorization:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">HR Dashboard</h1>
      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="leaves">Leave Management</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="payslips">Payslip Management</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
          <EmployeesPage />
        </TabsContent>
        <TabsContent value="leaves">
          <LeavesPage />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendancePage />
        </TabsContent>
        <TabsContent value="payslips">
          <PayslipsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}