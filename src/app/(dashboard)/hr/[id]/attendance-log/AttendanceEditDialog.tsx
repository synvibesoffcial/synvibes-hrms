'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Edit, Plus, Clock } from "lucide-react"
import { updateAttendance } from "@/actions/hr"
import { AttendanceSchema, type AttendanceFormData } from "./schemas"

type AttendanceRecord = {
  id: string
  date: Date
  checkIn: Date | null
  checkOut: Date | null
  markedBy: string
}

type AttendanceEditDialogProps = {
  employeeId: string
  employeeName: string
  existingRecord?: AttendanceRecord
  isNewRecord: boolean
  onSuccess?: () => void
}

export default function AttendanceEditDialog({ 
  employeeId, 
  employeeName, 
  existingRecord, 
  isNewRecord,
  onSuccess
}: AttendanceEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [serverMessage, setServerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  // Format time for input (HH:MM)
  const formatTimeForInput = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toTimeString().slice(0, 5);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(AttendanceSchema),
    defaultValues: {
      date: existingRecord 
        ? formatDateForInput(existingRecord.date)
        : new Date().toISOString().split('T')[0],
      checkIn: existingRecord 
        ? formatTimeForInput(existingRecord.checkIn)
        : "",
      checkOut: existingRecord 
        ? formatTimeForInput(existingRecord.checkOut)
        : "",
    },
  })

  const onSubmit = async (data: AttendanceFormData) => {
    setIsSubmitting(true)
    setServerMessage(null)

    try {
      const formData = new FormData()
      formData.append("date", data.date)
      formData.append("checkIn", data.checkIn || "")
      formData.append("checkOut", data.checkOut || "")

      const result = await updateAttendance(employeeId, {}, formData)
      
      if (result?.success) {
        setServerMessage({ text: result.message || 'Attendance updated successfully!', type: 'success' })
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
          className="text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          {isNewRecord ? (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </>
          ) : (
            <Edit className="w-4 h-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-900">
            <Clock className="w-5 h-5" />
            {isNewRecord ? 'Add Attendance Record' : 'Edit Attendance Record'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Employee Info */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-medium text-purple-900">Employee: {employeeName}</p>
          </div>

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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("date")}
                id="date"
                type="date"
                className="w-full"
                disabled={isSubmitting}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
                  Check In Time
                </label>
                <Input
                  {...register("checkIn")}
                  id="checkIn"
                  type="time"
                  className="w-full"
                  disabled={isSubmitting}
                />
                {errors.checkIn && (
                  <p className="mt-1 text-sm text-red-600">{errors.checkIn.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
                  Check Out Time
                </label>
                <Input
                  {...register("checkOut")}
                  id="checkOut"
                  type="time"
                  className="w-full"
                  disabled={isSubmitting}
                />
                {errors.checkOut && (
                  <p className="mt-1 text-sm text-red-600">{errors.checkOut.message}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Leave time fields empty to mark as absent. 
                Only check-in time is required to mark as present.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (isNewRecord ? 'Adding...' : 'Updating...') 
                  : (isNewRecord ? 'Add Record' : 'Update Record')
                }
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 