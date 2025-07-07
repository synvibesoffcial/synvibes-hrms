'use client';

import { useState, useEffect } from 'react';

interface Attendance {
fingerprint_id: number; // foreign key
timestamp: Date;
lat: number;
lon: number;
}

type Payroll = 'Reliever' | 'Consultant' | 'Employee' | 'other';

interface User {
fingerprint_id: number; // primary key
name: string;
employee_id: string;
created_at: Date;
location: string;
company: string;
designation: string;
payroll: Payroll;
}

interface UserAttendanceRecord {
fingerprint_id: number;
name: string;
employee_id: string;
location: string;
company: string;
designation: string;
payroll: Payroll;
user_created_at: Date;
attendance_timestamp: Date | null;
lat: number | null;
lon: number | null;
}

export default function TestPage() {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [usersData, setUsersData] = useState<User[]>([]);
  const [userAttendanceData, setUserAttendanceData] = useState<UserAttendanceRecord[]>([]);
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
          setUserAttendanceData(result.userAttendanceRecords);
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
            <th className="border p-2">Fingerprint ID</th>
            <th className="border p-2">Timestamp</th>
            <th className="border p-2">Latitude</th>
            <th className="border p-2">Longitude</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((record, index) => (
            <tr key={`${record.fingerprint_id}-${index}`}>
              <td className="border p-2">{record.fingerprint_id}</td>
              <td className="border p-2">{new Date(record.timestamp).toLocaleString()}</td>
              <td className="border p-2">{record.lat}</td>
              <td className="border p-2">{record.lon}</td>  
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
            <th className="border p-2">Employee ID</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Company</th>
            <th className="border p-2">Designation</th>
            <th className="border p-2">Payroll</th>
          </tr>
        </thead>
        <tbody>
          {usersData.map((user) => (
            <tr key={user.fingerprint_id}>
              <td className="border p-2">{user.fingerprint_id}</td>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.employee_id}</td>
              <td className="border p-2">{user.created_at.toString()}</td>
              <td className="border p-2">{user.location}</td>
              <td className="border p-2">{user.company}</td>
              <td className="border p-2">{user.designation}</td>
              <td className="border p-2">{user.payroll}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">Employee Attendance Records</h2>
      <p className="text-gray-600 mb-4">Combined view of users and their attendance records (linked by fingerprint_id)</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border mt-2 text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="border p-2 text-left">Fingerprint ID</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Employee ID</th>
              <th className="border p-2 text-left">Designation</th>
              <th className="border p-2 text-left">Company</th>
              <th className="border p-2 text-left">Location</th>
              <th className="border p-2 text-left">Payroll Type</th>
              <th className="border p-2 text-left">Attendance Time</th>
              <th className="border p-2 text-left">Latitude</th>
              <th className="border p-2 text-left">Longitude</th>
            </tr>
          </thead>
          <tbody>
            {userAttendanceData.map((record, index) => (
              <tr key={`${record.fingerprint_id}-${index}`} className={record.attendance_timestamp ? "bg-white" : "bg-gray-50"}>
                <td className="border p-2">{record.fingerprint_id}</td>
                <td className="border p-2 font-medium">{record.name}</td>
                <td className="border p-2">{record.employee_id}</td>
                <td className="border p-2">{record.designation}</td>
                <td className="border p-2">{record.company}</td>
                <td className="border p-2">{record.location}</td>
                <td className="border p-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    record.payroll === 'Employee' ? 'bg-green-100 text-green-800' :
                    record.payroll === 'Consultant' ? 'bg-blue-100 text-blue-800' :
                    record.payroll === 'Reliever' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.payroll}
                  </span>
                </td>
                <td className="border p-2">
                  {record.attendance_timestamp ? (
                    <span className="text-green-600">
                      {new Date(record.attendance_timestamp).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">No attendance</span>
                  )}
                </td>
                <td className="border p-2">
                  {record.lat !== null ? record.lat.toFixed(6) : '-'}
                </td>
                <td className="border p-2">
                  {record.lon !== null ? record.lon.toFixed(6) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {userAttendanceData.length === 0 && !error && (
        <div className="text-center py-4 text-gray-500">
          No employee attendance records found.
        </div>
      )}
    </div>
  );
}