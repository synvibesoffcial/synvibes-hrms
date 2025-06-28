import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, CheckCircle, Calendar, Clock } from "lucide-react"
import { getEmployeeById, getEmployeeLeaves } from "@/actions/hr"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import LeaveApprovalDialog from './LeaveApprovalDialog'

interface LeaveApprovalPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LeaveApprovalPage({ params }: LeaveApprovalPageProps) {
  // Check HR authorization
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session?.role !== 'hr') {
    redirect('/sign-in');
  }

  // Await the params promise
  const { id } = await params;

  const [employee, leaves] = await Promise.all([
    getEmployeeById(id),
    getEmployeeLeaves(id)
  ]);

  if (!employee) {
    notFound();
  }

  const pendingLeaves = leaves.filter(leave => leave.status === 'PENDING');
  const processedLeaves = leaves.filter(leave => leave.status !== 'PENDING');

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  const calculateDays = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-600">
              {employee.firstName} {employee.lastName} • {employee.empId}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingLeaves.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{leaves.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Approved This Year</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leaves.filter(leave => leave.status === 'APPROVED').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Leave Requests */}
      <Card className="border-purple-200 shadow-lg mb-8">
        <CardHeader className="border-b border-purple-200">
          <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Leave Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendingLeaves.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-purple-100">
                  <TableHead className="font-semibold text-purple-900">Date Range</TableHead>
                  <TableHead className="font-semibold text-purple-900">Days</TableHead>
                  <TableHead className="font-semibold text-purple-900">Reason</TableHead>
                  <TableHead className="font-semibold text-purple-900">Requested</TableHead>
                  <TableHead className="font-semibold text-purple-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeaves.map((leave) => (
                  <TableRow key={leave.id} className="border-purple-50 hover:bg-purple-50/50">
                    <TableCell className="font-medium">
                      {formatDateRange(leave.startDate, leave.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">
                        {calculateDays(leave.startDate, leave.endDate)} days
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-gray-900 truncate" title={leave.reason}>
                        {leave.reason}
                      </p>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <LeaveApprovalDialog 
                          leave={leave} 
                          action="approve"
                          employeeName={`${employee.firstName} ${employee.lastName}`}
                        />
                        <LeaveApprovalDialog 
                          leave={leave} 
                          action="reject"
                          employeeName={`${employee.firstName} ${employee.lastName}`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
              <p className="text-gray-600">All leave requests have been processed.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave History */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="border-b border-purple-200">
          <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leave History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {processedLeaves.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-purple-100">
                  <TableHead className="font-semibold text-purple-900">Date Range</TableHead>
                  <TableHead className="font-semibold text-purple-900">Days</TableHead>
                  <TableHead className="font-semibold text-purple-900">Reason</TableHead>
                  <TableHead className="font-semibold text-purple-900">Status</TableHead>
                  <TableHead className="font-semibold text-purple-900">Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedLeaves.map((leave) => (
                  <TableRow key={leave.id} className="border-purple-50 hover:bg-purple-50/50">
                    <TableCell className="font-medium">
                      {formatDateRange(leave.startDate, leave.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">
                        {calculateDays(leave.startDate, leave.endDate)} days
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-gray-900 truncate" title={leave.reason}>
                        {leave.reason}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        leave.status === 'APPROVED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave History</h3>
              <p className="text-gray-600">No processed leave requests found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
