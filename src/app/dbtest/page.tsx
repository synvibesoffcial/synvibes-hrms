'use client';

import { useState, useEffect } from 'react';



interface EmployeeAttendanceRecord {
  emp_id: string | null;
  fingerprint_id: string;
  name: string | null;
  company: string | null;
  timestamp: Date;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean | null;
}

export default function TestPage() {
  const [employeeAttendanceData, setEmployeeAttendanceData] = useState<EmployeeAttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ details?: string; code?: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/test-db');
        const result = await response.json();
        
        if (response.ok) {
          setEmployeeAttendanceData(result.employeeAttendanceRecords);
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

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-600">Employee Attendance Records</h2>
      <p className="text-gray-600 mb-4">Combined view of employees and their attendance records (linked by fingerprint_id)</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border mt-2 text-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="border p-2 text-left">Emp ID</th>
              <th className="border p-2 text-left">Fingerprint ID</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Company</th>
              <th className="border p-2 text-left">Timestamp</th>
              <th className="border p-2 text-left">Latitude</th>
              <th className="border p-2 text-left">Longitude</th>
              <th className="border p-2 text-left">Is Active</th>
            </tr>
          </thead>
          <tbody>
            {employeeAttendanceData.map((record, index) => (
              <tr key={`${record.fingerprint_id}-${index}`} className={record.emp_id ? "bg-white" : "bg-gray-50"}>
                <td className="border p-2">{record.emp_id || '-'}</td>
                <td className="border p-2 font-medium">{record.fingerprint_id}</td>
                <td className="border p-2 font-medium">{record.name || '-'}</td>
                <td className="border p-2">{record.company || '-'}</td>
                <td className="border p-2">
                  <span className="text-blue-600">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                </td>
                <td className="border p-2">
                  {record.latitude !== null ? Number(record.latitude).toFixed(6) : '-'}
                </td>
                <td className="border p-2">
                  {record.longitude !== null ? Number(record.longitude).toFixed(6) : '-'}
                </td>
                <td className="border p-2">
                  {record.is_active !== null ? (
                    <span className={`px-2 py-1 rounded text-xs ${
                      record.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.is_active ? 'Active' : 'Inactive'}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {employeeAttendanceData.length === 0 && !error && (
        <div className="text-center py-4 text-gray-500">
          No employee attendance records found.
        </div>
      )}
    </div>
  );
}