'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users } from "lucide-react"
import { assignEmployeesToTeam } from "@/actions/hr"

type Employee = {
  id: string
  firstName: string
  lastName: string
  empId: string
  teamId: string | null
}

type Team = {
  id: string
  name: string
  departmentId: string
}

type AddEmployeesToTeamDialogProps = {
  team: Team
  availableEmployees: Employee[]
}

export default function AddEmployeesToTeamDialog({ 
  team, 
  availableEmployees 
}: AddEmployeesToTeamDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [state, formAction] = useFormState(assignEmployeesToTeam.bind(null, team.id), {
    errors: {},
    message: '',
    success: false,
  })

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    // Add selected employees to form data
    selectedEmployees.forEach(employeeId => {
      formData.append('employeeIds', employeeId)
    })
    await formAction(formData)
    setIsSubmitting(false)
    
    if (state.success) {
      setSelectedEmployees([])
      setIsOpen(false)
    }
  }

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  // Filter employees that are not already assigned to any team
  const unassignedEmployees = availableEmployees.filter(emp => !emp.teamId)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-900">
            <UserPlus className="w-5 h-5" />
            Add Employees to {team.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {state.message && (
            <div className={`p-3 rounded-lg text-sm ${
              state.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {state.message}
            </div>
          )}

          <form action={handleSubmit}>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Available Employees (Not assigned to any team)
                </h3>
                
                {unassignedEmployees.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unassignedEmployees.map((employee) => (
                      <div 
                        key={employee.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedEmployees.includes(employee.id)
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleEmployee(employee.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              Employee ID: {employee.empId}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={() => toggleEmployee(employee.id)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No available employees to assign.</p>
                    <p className="text-sm">All employees are already assigned to teams.</p>
                  </div>
                )}
              </div>

              {selectedEmployees.length > 0 && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 mb-2">
                    Selected Employees ({selectedEmployees.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedEmployees.map(employeeId => {
                      const employee = unassignedEmployees.find(emp => emp.id === employeeId)
                      return employee ? (
                        <Badge key={employeeId} className="bg-purple-100 text-purple-800">
                          {employee.firstName} {employee.lastName}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isSubmitting || selectedEmployees.length === 0}
                >
                  {isSubmitting 
                    ? 'Adding...' 
                    : `Add ${selectedEmployees.length} Employee${selectedEmployees.length === 1 ? '' : 's'}`
                  }
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 