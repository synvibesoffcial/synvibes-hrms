'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users } from "lucide-react"
import { assignEmployeesToTeam } from "@/actions/hr"
import { AddEmployeesToTeamSchema, type AddEmployeesToTeamFormData } from "../schemas"

type Employee = {
  id: string
  firstName: string
  lastName: string
  empId: string
  teams: Array<{
    team: {
      id: string
      name: string
      department: {
        name: string
      }
    }
  }>
}

type Team = {
  id: string
  name: string
  departmentId: string
}

type AddEmployeesToTeamDialogProps = {
  team: Team
  availableEmployees: Employee[]
  onSuccess?: () => void
}

export default function AddEmployeesToTeamDialog({ 
  team, 
  availableEmployees,
  onSuccess
}: AddEmployeesToTeamDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const {
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<AddEmployeesToTeamFormData>({
    resolver: zodResolver(AddEmployeesToTeamSchema),
    defaultValues: {
      employeeIds: [],
    },
  })

  // Filter employees that are not already assigned to this specific team
  const availableForThisTeam = availableEmployees.filter(emp => 
    !emp.teams.some(teamAssignment => teamAssignment.team.id === team.id)
  )

  const toggleEmployee = (employeeId: string) => {
    const newSelection = selectedEmployees.includes(employeeId) 
      ? selectedEmployees.filter(id => id !== employeeId)
      : [...selectedEmployees, employeeId]
    
    setSelectedEmployees(newSelection)
    setValue("employeeIds", newSelection)
  }

  const onSubmit = async (data: AddEmployeesToTeamFormData) => {
    setIsSubmitting(true)
    setServerMessage(null)

    try {
      const formData = new FormData()
      data.employeeIds.forEach(employeeId => {
        formData.append('employeeIds', employeeId)
      })

      const result = await assignEmployeesToTeam(team.id, {}, formData)
      
      if (result?.success) {
        setServerMessage({ text: result.message || 'Employees assigned successfully!', type: 'success' })
        setSelectedEmployees([])
        setValue("employeeIds", [])
        reset()
        if (onSuccess) onSuccess()
        // Close dialog after a short delay to show success message
        setTimeout(() => {
          setIsOpen(false)
          setServerMessage(null)
        }, 1500)
      } else if (result?.message) {
        setServerMessage({ text: result.message, type: 'error' })
      }
    } catch {
      setServerMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSelectedEmployees([])
      setValue("employeeIds", [])
      setServerMessage(null)
      reset()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
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
          {serverMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              serverMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {serverMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Available Employees (Not in this team)
                </h3>
                
                {errors.employeeIds && (
                  <p className="mb-3 text-sm text-red-600">{errors.employeeIds.message}</p>
                )}
                
                {availableForThisTeam.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableForThisTeam.map((employee) => (
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
                            {employee.teams.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Current teams: {employee.teams.map(t => t.team.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedEmployees.includes(employee.id)}
                              onChange={() => toggleEmployee(employee.id)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              disabled={isSubmitting}
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
                    <p className="text-sm">All employees are already in this team.</p>
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
                      const employee = availableForThisTeam.find(emp => emp.id === employeeId)
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
                  disabled={isSubmitting}
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