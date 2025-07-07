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
  const [errorDetails, setErrorDetails] = useState<{ details?: string; code?: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/test-db');
        const result = await response.json();
        
        if (response.ok) {
          setAttendanceData(result.attendance);
          setUsersData(result.users);
          setError(null);
          setErrorDetails(null);
        } else {
          console.error('API Error Response:', result);
          setError(result.error || 'Failed to fetch data');
          setErrorDetails(result);
        }
      } catch (fetchError) {
        console.error('Fetch Error:', fetchError);
        setError('Error connecting to the server');
        setErrorDetails({ 
          details: fetchError instanceof Error ? fetchError.message : 'Network error',
          code: 'NETWORK_ERROR'
        });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Test Page</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 font-semibold">{error}</p>
          {errorDetails && (
            <div className="mt-2 text-sm text-red-600">
              {errorDetails.details && (
                <p><strong>Details:</strong> {errorDetails.details}</p>
              )}
              {errorDetails.code && (
                <p><strong>Error Code:</strong> {errorDetails.code}</p>
              )}
            </div>
          )}
        </div>
      )}

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