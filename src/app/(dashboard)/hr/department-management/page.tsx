import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Building, Users, Plus, Edit, Settings,
  ArrowLeft
 }
  from "lucide-react"
import { getAllDepartments } from "@/actions/hr"
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { redirect } from 'next/navigation'
import DepartmentForm from './DepartmentForm'
import DeleteDepartmentButton from './DeleteDepartmentButton'
import ViewDepartmentDialog from './ViewDepartmentDialog'
import Link from "next/link"


export default async function DepartmentManagementPage() {
  // Check HR authorization
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session?.role !== 'hr') {
    redirect('/sign-in');
  }

  const departments = await getAllDepartments();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 pt-8">
      <div className="flex items-center gap-3 mb-4">
          <Link href="/hr">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard 
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Department Management</h1>
        </div>
        <p className="text-gray-600">Organize your company structure with departments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departments.reduce((total, dept) => total + dept.teams.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {departments.reduce((total, dept) => 
                    total + dept.teams.reduce((teamTotal, team) => teamTotal + team.employees.length, 0), 0
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Table */}
      <Card className="border-purple-200 shadow-lg">
        <CardHeader className="border-b border-purple-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              All Departments
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Department
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Department</DialogTitle>
                </DialogHeader>
                <DepartmentForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-100">
                <TableHead className="font-semibold text-purple-900">Department Name</TableHead>
                <TableHead className="font-semibold text-purple-900">Description</TableHead>
                <TableHead className="font-semibold text-purple-900">Teams</TableHead>
                <TableHead className="font-semibold text-purple-900">Employees</TableHead>
                <TableHead className="font-semibold text-purple-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id} className="border-purple-50 hover:bg-purple-50/50">
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell className="text-gray-600">
                    {department.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">
                      {department.teams.length} teams
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      {department.teams.reduce((total, team) => total + team.employees.length, 0)} employees
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ViewDepartmentDialog department={department} />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Department</DialogTitle>
                          </DialogHeader>
                          <DepartmentForm department={department} />
                        </DialogContent>
                      </Dialog>
                      <DeleteDepartmentButton 
                        departmentId={department.id} 
                        departmentName={department.name}
                        hasTeams={department.teams.length > 0}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {departments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No departments found. Create your first department to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
