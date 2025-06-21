import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { getEmployeeByUserId } from '@/lib/dal';
import { getEmployeeLeaves, getEmployeeAttendance, getEmployeePayslips, getTodayAttendance } from '../employeeActions';
import { redirect } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LeaveRequestForm from '../LeaveRequestForm';
import AttendanceButtons from '../AttendanceButtons';

export default async function EmployeeDashboardPage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect('/sign-in');
  }

  const employee = await getEmployeeByUserId(session.userId as string);

  if (!employee) {
    redirect('/employee'); 
  }

  // Fetch tab-specific data using server actions
  const [leaves, attendance, payslips, todayAttendance] = await Promise.all([
    getEmployeeLeaves(employee.id),
    getEmployeeAttendance(employee.id),
    getEmployeePayslips(employee.id),
    getTodayAttendance(employee.id)
  ]);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Employee Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-6">Welcome, {employee.firstName} {employee.lastName}</h2>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payslips">Payslips</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p><strong>Employee ID:</strong> {employee.empId}</p>
                <p><strong>Date of Birth:</strong> {employee.dateOfBirth.toLocaleDateString()}</p>
                <p><strong>Gender:</strong> {employee.gender}</p>
                <p><strong>Join Date:</strong> {employee.joinDate.toLocaleDateString()}</p>
                {employee.address && <p><strong>Address:</strong> {employee.address}</p>}
                {employee.contactInfo && <p><strong>Contact Info:</strong> {employee.contactInfo}</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leaves" className="mt-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Leave Requests</h3>
              
              <LeaveRequestForm employeeId={employee.id} />
              
              {leaves && leaves.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium">Previous Leave Requests</h4>
                  {leaves.map((leave) => (
                    <div key={leave.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">Leave Request</h4>
                        <span className={`px-2 py-1 rounded text-sm ${
                          leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      <p><strong>Start Date:</strong> {leave.startDate.toLocaleDateString()}</p>
                      <p><strong>End Date:</strong> {leave.endDate.toLocaleDateString()}</p>
                      <p><strong>Reason:</strong> {leave.reason}</p>
                      <p><strong>Applied On:</strong> {leave.createdAt.toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No leave requests found.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Attendance</h3>
              
              <AttendanceButtons 
                employeeId={employee.id} 
                todayAttendance={todayAttendance}
              />
              
              <div>
                <h4 className="font-medium mb-4">Attendance History</h4>
                {attendance && attendance.length > 0 ? (
                  <div className="space-y-4">
                    {attendance.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <p><strong>Date:</strong> {record.date.toLocaleDateString()}</p>
                          <p><strong>Check In:</strong> {record.checkIn ? record.checkIn.toLocaleTimeString() : 'Not checked in'}</p>
                          <p><strong>Check Out:</strong> {record.checkOut ? record.checkOut.toLocaleTimeString() : 'Not checked out'}</p>
                        </div>
                        {(record.checkInLatitude && record.checkInLongitude) && (
                          <p className="mt-2 text-sm text-gray-600">
                            <strong>Check-in Location:</strong> {record.checkInLatitude.toFixed(6)}, {record.checkInLongitude.toFixed(6)}
                          </p>
                        )}
                        {(record.checkOutLatitude && record.checkOutLongitude) && (
                          <p className="text-sm text-gray-600">
                            <strong>Check-out Location:</strong> {record.checkOutLatitude.toFixed(6)}, {record.checkOutLongitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No attendance records found.</p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payslips" className="mt-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Payslips</h3>
              {payslips && payslips.length > 0 ? (
                <div className="space-y-4">
                  {payslips.map((payslip) => (
                    <div key={payslip.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{payslip.month} {payslip.year}</h4>
                          <p className="text-sm text-gray-600">Generated on {payslip.generatedAt.toLocaleDateString()}</p>
                        </div>
                        <a 
                          href={payslip.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No payslips found.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 