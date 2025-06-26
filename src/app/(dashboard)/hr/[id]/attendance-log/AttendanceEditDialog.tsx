'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Edit, Plus, Clock } from "lucide-react"
import { updateAttendance } from "@/actions/hr"

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
}

export default function AttendanceEditDialog({ 
  employeeId, 
  employeeName, 
  existingRecord, 
  isNewRecord 
}: AttendanceEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const action = updateAttendance.bind(null, employeeId)
  const [state, formAction] = useFormState(action, {
    errors: {},
    message: '',
    success: false,
  })

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    await formAction(formData)
    setIsSubmitting(false)
    
    if (state.success) {
      setIsOpen(false)
    }
  }

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

  const defaultDate = existingRecord 
    ? formatDateForInput(existingRecord.date)
    : new Date().toISOString().split('T')[0];

  const defaultCheckIn = existingRecord 
    ? formatTimeForInput(existingRecord.checkIn)
    : '';

  const defaultCheckOut = existingRecord 
    ? formatTimeForInput(existingRecord.checkOut)
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={defaultDate}
                className="w-full"
                required
              />
              {state.errors?.date && (
                <p className="mt-1 text-sm text-red-600">{state.errors.date[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
                  Check In Time
                </label>
                <Input
                  id="checkIn"
                  name="checkIn"
                  type="time"
                  defaultValue={defaultCheckIn}
                  className="w-full"
                />
                {state.errors?.checkIn && (
                  <p className="mt-1 text-sm text-red-600">{state.errors.checkIn[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
                  Check Out Time
                </label>
                <Input
                  id="checkOut"
                  name="checkOut"
                  type="time"
                  defaultValue={defaultCheckOut}
                  className="w-full"
                />
                {state.errors?.checkOut && (
                  <p className="mt-1 text-sm text-red-600">{state.errors.checkOut[0]}</p>
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