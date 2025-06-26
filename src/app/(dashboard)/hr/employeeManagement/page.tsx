import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserCog } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getAllEmployees, getHRDashboardStats } from "@/actions/hr"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { redirect } from 'next/navigation'

const employeeManagementPage = async() => {
    const cookieStore = await cookies();
      const cookie = cookieStore.get('session')?.value;
      const session = await decrypt(cookie);
    
      if (!session?.userId || session?.role !== 'hr') {
        redirect('/sign-in');
      }
    const [employees, stats] = await Promise.all([
        getAllEmployees(),
        getHRDashboardStats(),
      ]);
  return (
      <div>      {/* Employee List */}
          <Card className="mt-8 border-purple-200 shadow-lg">
              <CardHeader className="border-b border-purple-200">
                  <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                      <UserCog className="w-5 h-5" />
                      Employee Management ({employees.length} employees)
                  </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  <div className="overflow-x-auto">
                      <Table>
                          <TableHeader>
                              <TableRow className="border-b border-purple-100">
                                  <TableHead className="text-purple-900 font-semibold">Employee</TableHead>
                                  <TableHead className="text-purple-900 font-semibold">Employee ID</TableHead>
                                  <TableHead className="text-purple-900 font-semibold">Department</TableHead>
                                  <TableHead className="text-purple-900 font-semibold">Team</TableHead>
                                  <TableHead className="text-purple-900 font-semibold">Contact</TableHead>
                                  <TableHead className="text-purple-900 font-semibold">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {employees.map((employee) => (
                                  <TableRow key={employee.id} className="hover:bg-purple-50 transition-colors">
                                      <TableCell>
                                          <div className="flex items-center gap-3">
                                              <Avatar className="w-8 h-8">
                                                  <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
                                                      {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                                                  </AvatarFallback>
                                              </Avatar>
                                              <div>
                                                  <p className="font-medium text-gray-900">
                                                      {employee.firstName} {employee.lastName}
                                                  </p>
                                              </div>
                                          </div>
                                      </TableCell>
                                      <TableCell>
                                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                              {employee.empId}
                                          </code>
                                      </TableCell>
                                      <TableCell>
                                          <Badge className="bg-blue-100 text-blue-800">
                                              {employee.team?.department?.name || 'Not Assigned'}
                                          </Badge>
                                      </TableCell>
                                      <TableCell>
                                          <Badge className="bg-green-100 text-green-800">
                                              {employee.team?.name || 'Not Assigned'}
                                          </Badge>
                                      </TableCell>
                                      <TableCell>
                                          <span className="text-sm text-gray-600">
                                              {employee.user.email}
                                          </span>
                                      </TableCell>
                                      <TableCell>
                                          <Link href={`/hr/${employee.id}`}>
                                              <Button
                                                  size="sm"
                                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                              >
                                                  <UserCog className="w-4 h-4 mr-1" />
                                                  Manage
                                              </Button>
                                          </Link>
                                      </TableCell>
                                  </TableRow>
                              ))}
                          </TableBody>
                      </Table>
                  </div>

                  {employees.length === 0 && (
                      <div className="text-center py-12">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                          <p className="text-gray-600">No employees have been added to the system yet.</p>
                      </div>
                  )}
              </CardContent>
          </Card></div>
  )
}

export default employeeManagementPage