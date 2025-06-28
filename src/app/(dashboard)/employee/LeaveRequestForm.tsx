"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createLeaveRequest } from "./employeeActions"
import { LeaveRequestSchema } from "./schemas"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { useState } from "react"

interface LeaveRequestFormProps {
  employeeId: string
}

type LeaveRequestFormData = z.infer<typeof LeaveRequestSchema>;

export default function LeaveRequestForm({ employeeId }: LeaveRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverMessage, setServerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(LeaveRequestSchema),
  })

  const onSubmit = async (data: LeaveRequestFormData) => {
    setIsSubmitting(true)
    setServerMessage(null)

    try {
      const formData = new FormData()
      formData.append("startDate", data.startDate)
      formData.append("endDate", data.endDate)
      formData.append("reason", data.reason)

      const result = await createLeaveRequest(employeeId, {}, formData)
      
      if (result?.success) {
        setServerMessage({ text: result.message || 'Leave request submitted successfully!', type: 'success' })
        reset() // Clear the form on success
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
    <div className="border border-purple-200 rounded-lg p-6 bg-gradient-to-r from-purple-50/50 to-white">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        <h4 className="font-medium text-gray-900">Request New Leave</h4>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("startDate")}
              type="date"
              id="startDate"
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              disabled={isSubmitting}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm">{errors.startDate.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("endDate")}
              type="date"
              id="endDate"
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
              disabled={isSubmitting}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm">{errors.endDate.message}</p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("reason")}
            id="reason"
            rows={3}
            className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Please provide a reason for your leave request..."
            disabled={isSubmitting}
          />
          {errors.reason && (
            <p className="text-red-500 text-sm">{errors.reason.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Leave Request"}
        </Button>
        
        {serverMessage && (
          <div
            className={`text-sm p-3 rounded-lg ${
              serverMessage.type === 'success'
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
          >
            {serverMessage.text}
          </div>
        )}
      </form>
    </div>
  )
}
