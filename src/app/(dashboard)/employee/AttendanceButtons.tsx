'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { checkIn, checkOut } from './employeeActions';

interface AttendanceButtonsProps {
  employeeId: string;
  todayAttendance?: {
    checkIn: Date | null;
    checkOut: Date | null;
  } | null;
}

export default function AttendanceButtons({ employeeId, todayAttendance }: AttendanceButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          resolve(null); // Continue without location if denied
        }
      );
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setMessage('');

    try {
      const location = await getLocation();
      const result = await checkIn(
        employeeId,
        location?.latitude,
        location?.longitude
      );
      setMessage(result.message);
    } catch {
      setMessage('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setMessage('');

    try {
      const location = await getLocation();
      const result = await checkOut(
        employeeId,
        location?.latitude,
        location?.longitude
      );
      setMessage(result.message);
    } catch {
      setMessage('Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h4 className="font-medium mb-4">Today&apos;s Attendance</h4>
      
      {todayAttendance && (
        <div className="mb-4 space-y-2">
          {todayAttendance.checkIn && (
            <p className="text-sm">
              <strong>Checked In:</strong> {new Date(todayAttendance.checkIn).toLocaleTimeString()}
            </p>
          )}
          {todayAttendance.checkOut && (
            <p className="text-sm">
              <strong>Checked Out:</strong> {new Date(todayAttendance.checkOut).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          onClick={handleCheckIn}
          disabled={loading || (todayAttendance?.checkIn !== null)}
          className="flex-1"
        >
          {loading ? 'Processing...' : 'Check In'}
        </Button>
        
        <Button
          onClick={handleCheckOut}
          disabled={loading || !todayAttendance?.checkIn || (todayAttendance?.checkOut !== null)}
          variant="outline"
          className="flex-1"
        >
          {loading ? 'Processing...' : 'Check Out'}
        </Button>
      </div>

      {message && (
        <p className={`text-sm mt-4 ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
