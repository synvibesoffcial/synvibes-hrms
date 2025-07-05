'use client';

import { useState, useEffect } from 'react';

interface Attendance {
  id: number;
  user_id: number;
  check_in: string;
}

interface User {
  id: number;
  name: string;
}

export default function TestPage() {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [usersData, setUsersData] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/test-db');
        const result = await response.json();
        
        if (response.ok) {
          setAttendanceData(result.attendance);
          setUsersData(result.users);
        } else {
          setError(result.error || 'Failed to fetch data');
        }
      } catch {
        setError('Error connecting to the server');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Test Page</h1>
      
      {error && <p className="text-red-500">{error}</p>}

      <h2 className="text-xl font-semibold mt-4">Attendance Records</h2>
      <table className="w-full border-collapse border mt-2">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">User ID</th>
            <th className="border p-2">Check In</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((record) => (
            <tr key={record.id}>
              <td className="border p-2">{record.id}</td>
              <td className="border p-2">{record.user_id}</td>
              <td className="border p-2">{record.check_in}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mt-4">Users</h2>
      <table className="w-full border-collapse border mt-2">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {usersData.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">{user.id}</td>
              <td className="border p-2">{user.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}