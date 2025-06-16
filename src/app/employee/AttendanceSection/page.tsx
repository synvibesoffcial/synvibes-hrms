"use client";
import { useState } from "react";
import { markAttendance } from "../actions";

interface Attendance {
  id: string;
  date: Date | string;
  checkIn: Date | string | null;
  checkOut: Date | string | null;
}

interface Employee {
  id: string;
  attendance: Attendance[];
}

export default function AttendanceSection({ employee }: { employee: Employee }) {
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = employee.attendance.find((a) => {
    const date = a.date instanceof Date ? a.date.toISOString().split("T")[0] : a.date;
    return date === today;
  });

  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold text-lg mb-2">Attendance</h2>
      {!todayAttendance ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await markAttendance(employee.id, "checkin");
            window.location.reload();
          }}
        >
          Check In
        </button>
      ) : !todayAttendance.checkOut ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await markAttendance(employee.id, "checkout");
            window.location.reload();
          }}
        >
          Check Out
        </button>
      ) : (
        <div>
          Checked in:{" "}
          {todayAttendance.checkIn
            ? new Date(todayAttendance.checkIn).toLocaleTimeString()
            : "N/A"}
          <br />
          Checked out:{" "}
          {todayAttendance.checkOut
            ? new Date(todayAttendance.checkOut).toLocaleTimeString()
            : "N/A"}
        </div>
      )}
      <h3 className="font-bold mt-4">Attendance Records</h3>
      <ul>
        {employee.attendance.map((a) => (
          <li key={a.id}>
            {a.date instanceof Date
              ? a.date.toLocaleDateString()
              : a.date}
            :{" "}
            {a.checkIn
              ? `In: ${new Date(a.checkIn).toLocaleTimeString()}`
              : "Not checked in"}
            {a.checkOut
              ? `, Out: ${new Date(a.checkOut).toLocaleTimeString()}`
              : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}