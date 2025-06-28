'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogClose } from "@/components/ui/dialog"
import { createDepartment, updateDepartment } from "@/actions/hr"
import { DepartmentSchema, type DepartmentFormData } from "../schemas"

type Department = {
  id: string
  name: string
  description: string | null
}

type DepartmentFormProps = {
  department?: Department
  onSuccess?: () => void
}

export default function DepartmentForm({ department, onSuccess }: DepartmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(DepartmentSchema),
    defaultValues: {
      name: department?.name || "",
      description: department?.description || "",
    },
  })

  const onSubmit = async (data: DepartmentFormData) => {
    setIsSubmitting(true)
    setServerMessage(null)

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description || "")

      const result = department
        ? await updateDepartment(department.id, {}, formData)
        : await createDepartment({}, formData)
      
      if (result?.success) {
        setServerMessage({ text: result.message || 'Department saved successfully!', type: 'success' })
        if (!department) reset() // Clear form only for new department
        if (onSuccess) onSuccess()
      } else if (result?.message) {
        setServerMessage({ text: result.message, type: 'error' })
      }
    } catch {
      setServerMessage({ text: 'An unexpected error occurred. Please try again.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Department Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name")}
            id="name"
            type="text"
            placeholder="Enter department name"
            className="w-full"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Input
            {...register("description")}
            id="description"
            type="text"
            placeholder="Enter department description (optional)"
            className="w-full"
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
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