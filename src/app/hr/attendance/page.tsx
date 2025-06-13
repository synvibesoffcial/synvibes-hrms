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
import { getAttendanceRecords } from "./actions";

interface AttendanceRecord {
  id: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  markedBy: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { userId } = useAuth();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data, error } = await getAttendanceRecords(selectedDate);
        if (error) throw new Error(error);
        setRecords(data || []);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecords();
    }
  }, [selectedDate, userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Attendance Records</h1>
      <div className="mb-4">
        <Input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            setSelectedDate(new Date(e.target.value))
          }
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Marked By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                {record.employee.user.firstName} {record.employee.user.lastName}
              </TableCell>
              <TableCell>
                {record.checkIn
                  ? new Date(record.checkIn).toLocaleTimeString()
                  : "Not checked in"}
              </TableCell>
              <TableCell>
                {record.checkOut
                  ? new Date(record.checkOut).toLocaleTimeString()
                  : "Not checked out"}
              </TableCell>
              <TableCell>
                {!record.checkIn
                  ? "Absent"
                  : !record.checkOut
                  ? "Present"
                  : "Completed"}
              </TableCell>
              <TableCell>{record.markedBy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 