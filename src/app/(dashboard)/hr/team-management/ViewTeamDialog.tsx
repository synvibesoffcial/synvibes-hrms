'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Users, X } from "lucide-react"
import { removeEmployeeFromTeam } from "@/actions/hr"

type Employee = {
  id: string
  firstName: string
  lastName: string
  empId: string
}

type Department = {
  id: string
  name: string
}

type Team = {
  id: string
  name: string
  description: string | null
  department: Department
  employees: Array<{
    employee: Employee
  }>
}

type ViewTeamDialogProps = {
  team: Team
}

export default function ViewTeamDialog({ team }: ViewTeamDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [removingEmployeeId, setRemovingEmployeeId] = useState<string | null>(null)

  const handleRemoveEmployee = async (employeeId: string) => {
    setRemovingEmployeeId(employeeId)
    try {
      const result = await removeEmployeeFromTeam(employeeId, team.id)
      if (result.success) {
        // The page will revalidate automatically
      }
    } catch (error) {
      console.error('Error removing employee:', error)
    } finally {
      setRemovingEmployeeId(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-900">
            <Users className="w-5 h-5" />
            Team Details: {team.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Team Info */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Team Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Name: </span>
                <span className="text-sm text-gray-900">{team.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Department: </span>
                <Badge className="bg-blue-100 text-blue-800">
                  {team.department.name}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Description: </span>
                <span className="text-sm text-gray-900">{team.description || 'No description provided'}</span>
              </div>
              <div className="flex gap-4 mt-3">
                <Badge className="bg-green-100 text-green-800">
                  {team.employees.length} employees
                </Badge>
              </div>
            </div>
          </div>

          {/* Employees List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members
            </h3>
            
            {team.employees.length > 0 ? (
              <div className="space-y-3">
                {team.employees.map((employeeAssignment) => (
                  <Card key={employeeAssignment.employee.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {employeeAssignment.employee.firstName} {employeeAssignment.employee.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Employee ID: {employeeAssignment.employee.empId}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRemoveEmployee(employeeAssignment.employee.id)}
                          disabled={removingEmployeeId === employeeAssignment.employee.id}
                          title="Remove employee from team"
                        >
                          {removingEmployeeId === employeeAssignment.employee.id ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No employees assigned to this team yet.</p>
                <p className="text-sm">Use the &quot;Add Employees&quot; button to assign employees to this team.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 