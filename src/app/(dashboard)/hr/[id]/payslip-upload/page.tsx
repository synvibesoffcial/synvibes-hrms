import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, FileText, Upload, Download, Calendar } from "lucide-react"
import { getEmployeeById, getEmployeePayslips } from "@/actions/hr"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PayslipUploadDialog from './PayslipUploadDialog'

interface PayslipUploadPageProps {
  params: {
    id: string
  }
}

export default async function PayslipUploadPage({ params }: PayslipUploadPageProps) {
  // Check HR authorization
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session?.role !== 'hr') {
    redirect('/sign-in');
  }

  const [employee, payslips] = await Promise.all([
    getEmployeeById(params.id),
    getEmployeePayslips(params.id)
  ]);

  if (!employee) {
    notFound();
  }

  // Get current year and calculate stats
  const currentYear = new Date().getFullYear();
  const currentYearPayslips = payslips.filter(payslip => payslip.year === currentYear);

  const getMonthName = (monthNum: string) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNum) - 1] || monthNum;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 pt-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/hr/${params.id}`}>
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
            <h1 className="text-3xl font-bold text-gray-900">Payslip Management</h1>
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
                <p className="text-sm font-medium text-gray-600">Total Payslips</p>
                <p className="text-2xl font-bold text-gray-900">{payslips.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Year</p>
                <p className="text-2xl font-bold text-gray-900">{currentYearPayslips.length}</p>
                <p className="text-xs text-gray-500">{currentYear}</p>
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
                <p className="text-sm font-medium text-gray-600">Latest</p>
                <p className="text-2xl font-bold text-gray-900">
                  {payslips.length > 0 ? getMonthName(payslips[0].month) : 'None'}
                </p>
                <p className="text-xs text-gray-500">
                  {payslips.length > 0 ? payslips[0].year : ''}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card className="border-purple-200 shadow-lg mb-8">
        <CardHeader className="border-b border-purple-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Payslip
            </CardTitle>
            <PayslipUploadDialog 
              employeeId={params.id}
              employeeName={`${employee.firstName} ${employee.lastName}`}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Payslip</h3>
              <p className="text-gray-600 mb-4">
                Click the button above to upload a new payslip for {employee.firstName} {employee.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payslips History */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="border-b border-purple-200">
          <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Payslips History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payslips.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-purple-100">
                  <TableHead className="font-semibold text-purple-900">Period</TableHead>
                  <TableHead className="font-semibold text-purple-900">Month</TableHead>
                  <TableHead className="font-semibold text-purple-900">Year</TableHead>
                  <TableHead className="font-semibold text-purple-900">Generated</TableHead>
                  <TableHead className="font-semibold text-purple-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id} className="border-purple-50 hover:bg-purple-50/50">
                    <TableCell className="font-medium">
                      {getMonthName(payslip.month)} {payslip.year}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">
                        {getMonthName(payslip.month)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-100 text-purple-800">
                        {payslip.year}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(payslip.generatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          asChild
                        >
                          <a href={payslip.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payslips</h3>
              <p className="text-gray-600">No payslips have been uploaded for this employee yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
