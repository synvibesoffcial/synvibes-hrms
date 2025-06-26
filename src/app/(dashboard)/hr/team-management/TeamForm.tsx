'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogClose } from "@/components/ui/dialog"
import { createTeam, updateTeam } from "@/actions/hr"

type Department = {
  id: string
  name: string
  description: string | null
}

type Team = {
  id: string
  name: string
  description: string | null
  departmentId: string
  department: Department
}

type TeamFormProps = {
  team?: Team
  departments: Department[]
}

export default function TeamForm({ team, departments }: TeamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(team?.departmentId || '')
  
  const action = team 
    ? updateTeam.bind(null, team.id)
    : createTeam

  const [state, formAction] = useFormState(action, {
    errors: {},
    message: '',
    success: false,
  })

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    formData.set('departmentId', selectedDepartment)
    await formAction(formData)
    setIsSubmitting(false)
  }

  return (
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
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter team name"
            defaultValue={team?.name || ''}
            className="w-full"
            required
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.departmentId && (
            <p className="mt-1 text-sm text-red-600">{state.errors.departmentId[0]}</p>
          )}
          {!selectedDepartment && departments.length === 0 && (
            <p className="mt-1 text-sm text-yellow-600">
              No departments available. Please create a department first.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Input
            id="description"
            name="description"
            type="text"
            placeholder="Enter team description (optional)"
            defaultValue={team?.description || ''}
            className="w-full"
          />
          {state.errors?.description && (
            <p className="mt-1 text-sm text-red-600">{state.errors.description[0]}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isSubmitting || !selectedDepartment || departments.length === 0}
          >
            {isSubmitting 
              ? (team ? 'Updating...' : 'Creating...') 
              : (team ? 'Update Team' : 'Create Team')
            }
          </Button>
        </div>
      </form>
    </div>
  )
} 