import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Clock, Calendar } from "lucide-react"
import { getEmployeeById, getEmployeeAttendance } from "@/actions/hr"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AttendanceEditDialog from './AttendanceEditDialog'

interface AttendanceLogPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    month?: string
    year?: string
  }>
}

export default async function AttendanceLogPage({ params, searchParams }: AttendanceLogPageProps) {
  // Check HR authorization
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session?.role !== 'hr') {
    redirect('/sign-in');
  }

  // Await the promises
  const { id } = await params;
  const searchParamsResolved = await searchParams;

  const currentDate = new Date();
  const selectedMonth = searchParamsResolved.month || (currentDate.getMonth() + 1).toString();
  const selectedYear = searchParamsResolved.year || currentDate.getFullYear().toString();

  const [employee, attendance] = await Promise.all([
    getEmployeeById(id),
    getEmployeeAttendance(id, selectedMonth, parseInt(selectedYear))
  ]);

  if (!employee) {
    notFound();
  }

  // Calculate statistics
  const totalDays = attendance.length;
  const presentDays = attendance.filter(att => att.checkIn).length;
  const lateDays = attendance.filter(att => {
    if (!att.checkIn) return false;
    const checkInTime = new Date(att.checkIn).getHours() * 60 + new Date(att.checkIn).getMinutes();
    return checkInTime > 9 * 60 + 30; // After 9:30 AM
  }).length;

  const formatTime = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateHours = (checkIn: Date | null, checkOut: Date | null) => {
    if (!checkIn || !checkOut) return '-';
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
    return `${hours}h`;
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/hr/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-purple-100 text-purple-600 font-semibold">
              {employee.firstName[0]}{employee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Log</h1>
            <p className="text-gray-600">
              {employee.firstName} {employee.lastName} • {employee.empId}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Month:</label>
          <Select value={selectedMonth}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <Select value={selectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-bold text-gray-900">{presentDays}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Late Days</p>
                <p className="text-2xl font-bold text-gray-900">{lateDays}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="border-b border-purple-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Attendance Records - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </CardTitle>
            <AttendanceEditDialog 
              employeeId={id}
              employeeName={`${employee.firstName} ${employee.lastName}`}
              isNewRecord={true}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {attendance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-purple-100">
                  <TableHead className="font-semibold text-purple-900">Date</TableHead>
                  <TableHead className="font-semibold text-purple-900">Check In</TableHead>
                  <TableHead className="font-semibold text-purple-900">Check Out</TableHead>
                  <TableHead className="font-semibold text-purple-900">Hours</TableHead>
                  <TableHead className="font-semibold text-purple-900">Status</TableHead>
                  <TableHead className="font-semibold text-purple-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id} className="border-purple-50 hover:bg-purple-50/50">
                    <TableCell className="font-medium">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell>
                      <span className={record.checkIn ? "text-gray-900" : "text-gray-400"}>
                        {formatTime(record.checkIn)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={record.checkOut ? "text-gray-900" : "text-gray-400"}>
                        {formatTime(record.checkOut)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {calculateHours(record.checkIn, record.checkOut)}
                    </TableCell>
                    <TableCell>
                      {record.checkIn ? (
                        <Badge className="bg-green-100 text-green-800">
                          Present
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Absent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <AttendanceEditDialog 
                        employeeId={id}
                        employeeName={`${employee.firstName} ${employee.lastName}`}
                        existingRecord={record}
                        isNewRecord={false}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
              <p className="text-gray-600">No attendance records found for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
