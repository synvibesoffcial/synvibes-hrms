'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogClose } from "@/components/ui/dialog"
import { createDepartment, updateDepartment } from "@/actions/hr"

type Department = {
  id: string
  name: string
  description: string | null
}

type DepartmentFormProps = {
  department?: Department
}

export default function DepartmentForm({ department }: DepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const action = department 
    ? updateDepartment.bind(null, department.id)
    : createDepartment

  const [state, formAction] = useFormState(action, {
    errors: {},
    message: '',
    success: false,
  })

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
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
            Department Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter department name"
            defaultValue={department?.name || ''}
            className="w-full"
            required
          />
          {state.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
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
            placeholder="Enter department description (optional)"
            defaultValue={department?.description || ''}
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
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (department ? 'Updating...' : 'Creating...') 
              : (department ? 'Update Department' : 'Create Department')
            }
          </Button>
        </div>
      </form>
    </div>
  )
} 