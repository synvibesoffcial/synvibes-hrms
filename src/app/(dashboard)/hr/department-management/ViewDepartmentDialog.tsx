'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Users, Building } from "lucide-react"

type Employee = {
  id: string
  firstName: string
  lastName: string
  empId: string
}

type Team = {
  id: string
  name: string
  description: string | null
  employees: Array<{
    employee: Employee
  }>
}

type Department = {
  id: string
  name: string
  description: string | null
  teams: Team[]
}

type ViewDepartmentDialogProps = {
  department: Department
}

export default function ViewDepartmentDialog({ department }: ViewDepartmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const totalEmployees = department.teams.reduce((total, team) => total + team.employees.length, 0)

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
            <Building className="w-5 h-5" />
            Department Details: {department.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Department Info */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Department Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-600">Name: </span>
                <span className="text-sm text-gray-900">{department.name}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Description: </span>
                <span className="text-sm text-gray-900">{department.description || 'No description provided'}</span>
              </div>
              <div className="flex gap-4 mt-3">
                <Badge className="bg-blue-100 text-blue-800">
                  {department.teams.length} teams
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {totalEmployees} employees
                </Badge>
              </div>
            </div>
          </div>

          {/* Teams List */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Teams in this Department
            </h3>
            
            {department.teams.length > 0 ? (
              <div className="space-y-3">
                {department.teams.map((team) => (
                  <Card key={team.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{team.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {team.description || 'No description'}
                          </p>
                          <div className="mt-2">
                            <Badge className="bg-green-100 text-green-800">
                              {team.employees.length} employees
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      {/* Show team members if any */}
                      {team.employees.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-2">Team Members:</p>
                          <div className="flex flex-wrap gap-1">
                            {team.employees.map((employeeAssignment) => (
                              <Badge key={employeeAssignment.employee.id} variant="outline" className="text-xs">
                                {employeeAssignment.employee.firstName} {employeeAssignment.employee.lastName} ({employeeAssignment.employee.empId})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No teams in this department yet.</p>
                <p className="text-sm">Create teams to organize employees within this department.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 