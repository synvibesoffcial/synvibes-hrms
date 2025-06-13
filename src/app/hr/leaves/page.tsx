"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLeaveRequests, updateLeaveRequestStatus } from "./actions";

interface LeaveRequest {
  id: string;
  employee: {
    user: {
      firstName: string;
      lastName: string;
    };
  };
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
}

export default function LeavesPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const { data, error } = await getLeaveRequests();
        if (error) throw new Error(error);
        setLeaveRequests(data || []);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchLeaveRequests();
    }
  }, [userId]);

  const handleLeaveAction = async (requestId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const { data, error } = await updateLeaveRequestStatus(requestId, status);
      if (error) throw new Error(error);
      
      setLeaveRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status } : request
        )
      );
    } catch (error) {
      console.error("Error updating leave request:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leave Requests</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                {request.employee.user.firstName} {request.employee.user.lastName}
              </TableCell>
              <TableCell>
                {new Date(request.startDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(request.endDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{request.reason}</TableCell>
              <TableCell>{request.status}</TableCell>
              <TableCell>
                {request.status === "PENDING" && (
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleLeaveAction(request.id, "APPROVED")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleLeaveAction(request.id, "REJECTED")}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 
