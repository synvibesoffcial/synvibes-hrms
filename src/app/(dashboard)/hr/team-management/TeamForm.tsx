'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogClose } from "@/components/ui/dialog"
import { createTeam, updateTeam } from "@/actions/hr"
import { TeamSchema, type TeamFormData } from "../schemas"

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
  onSuccess?: () => void
}

export default function TeamForm({ team, departments, onSuccess }: TeamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TeamFormData>({
    resolver: zodResolver(TeamSchema),
    defaultValues: {
      name: team?.name || "",
      description: team?.description || "",
      departmentId: team?.departmentId || "",
    },
  })

  const selectedDepartmentId = watch("departmentId")

  const onSubmit = async (data: TeamFormData) => {
    setIsSubmitting(true)
    setServerMessage(null)

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description || "")
      formData.append("departmentId", data.departmentId)

      const result = team
        ? await updateTeam(team.id, {}, formData)
        : await createTeam({}, formData)
      
      if (result?.success) {
        setServerMessage({ text: result.message || 'Team saved successfully!', type: 'success' })
        if (!team) reset() // Clear form only for new team
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
            Team Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("name")}
            id="name"
            type="text"
            placeholder="Enter team name"
            className="w-full"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <Select 
            value={selectedDepartmentId} 
            onValueChange={(value) => setValue("departmentId", value)}
            disabled={isSubmitting}
          >
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
          {errors.departmentId && (
            <p className="mt-1 text-sm text-red-600">{errors.departmentId.message}</p>
          )}
          {departments.length === 0 && (
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
            {...register("description")}
            id="description"
            type="text"
            placeholder="Enter team description (optional)"
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
            disabled={isSubmitting || !selectedDepartmentId || departments.length === 0}
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