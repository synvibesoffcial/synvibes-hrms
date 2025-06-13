"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPayslips, uploadPayslip, getEmployees } from "./actions";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Payslip {
  id: string;
  employee: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  month: string;
  year: number;
  fileUrl: string;
  generatedAt: Date;
}

export default function PayslipsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingPayslips, setLoadingPayslips] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await getEmployees();
        if (error) throw new Error(error);
        setEmployees(data || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    if (userId) {
      fetchEmployees();
    }
  }, [userId]);

  useEffect(() => {
    const fetchPayslips = async () => {
      if (!selectedEmployee) {
        setPayslips([]);
        return;
      }

      setLoadingPayslips(true);
      try {
        const { data, error } = await getPayslips(selectedMonth, selectedYear);
        if (error) throw new Error(error);
        setPayslips(data?.filter(p => p.employee.id === selectedEmployee) || []);
      } catch (error) {
        console.error("Error fetching payslips:", error);
      } finally {
        setLoadingPayslips(false);
      }
    };

    if (userId && selectedEmployee) {
      fetchPayslips();
    }
  }, [selectedMonth, selectedYear, userId, selectedEmployee]);

  const handleFileUpload = async (employeeId: string, file: File) => {
    setUploadStatus(null);
    setUploading(true);
    try {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setUploadStatus("Invalid file type. Please upload a PDF, JPG, or PNG file.");
        return;
      }

      const { data, error } = await uploadPayslip(
        employeeId,
        selectedMonth,
        selectedYear,
        file
      );
      if (error) throw new Error(error);

      if (data) {
        setPayslips((prev) => [...prev, data]);
        setUploadStatus("Payslip uploaded successfully!");
        const { data: updatedPayslips } = await getPayslips(selectedMonth, selectedYear);
        setPayslips(updatedPayslips?.filter(p => p.employee.id === selectedEmployee) || []);
      }
    } catch (error: any) {
      console.error("Error uploading payslip:", error);
      setUploadStatus(`Failed to upload payslip: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loadingEmployees) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading employees...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payslips Management</h1>

      {/* Employees Table */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Employees</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow
                key={employee.id}
                className={selectedEmployee === employee.id ? "bg-gray-100" : ""}
              >
                <TableCell>
                  {employee.firstName} {employee.lastName}
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelectedEmployee(employee.id)}
                    className="text-blue-600 hover:underline"
                  >
                    View Payslips
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payslips Section */}
      {selectedEmployee && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Payslips</h2>
            <div className="flex gap-4">
              <Select
                value={selectedMonth}
                onValueChange={(value: string) => setSelectedMonth(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = new Date(2000, i).toLocaleString("default", {
                      month: "long",
                    });
                    return (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={selectedYear}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedYear(parseInt(e.target.value))
                }
                className="w-[120px]"
              />
              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(selectedEmployee, file);
                    }
                  }}
                  className="w-[200px]"
                  disabled={uploading}
                />
                {uploading ? (
                  <div className="text-xs text-gray-500 mt-1">Uploading...</div>
                ) : (
                  <div className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG files only</div>
                )}
              </div>
            </div>
          </div>

          {uploadStatus && (
            <div
              className={`mb-4 p-2 rounded ${
                uploadStatus.includes("successfully")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {uploadStatus}
            </div>
          )}

          {loadingPayslips ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-lg">Loading payslips...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Generated At</TableHead>
                  <TableHead>File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No payslips found for this period
                    </TableCell>
                  </TableRow>
                ) : (
                  payslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell>{payslip.month}</TableCell>
                      <TableCell>{payslip.year}</TableCell>
                      <TableCell>
                        {new Date(payslip.generatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <a
                          href={payslip.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View File
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}