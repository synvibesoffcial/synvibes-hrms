"use client"

import { useActionState } from "react"
import { createLeaveRequest } from "./employeeActions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

interface LeaveRequestFormProps {
  employeeId: string
}

export default function LeaveRequestForm({ employeeId }: LeaveRequestFormProps) {
  const initialState = { message: "", errors: {} }
  const createLeaveRequestWithId = createLeaveRequest.bind(null, employeeId)
  const [state, dispatch] = useActionState(createLeaveRequestWithId, initialState)

  return (
    <div className="border border-purple-200 rounded-lg p-6 bg-gradient-to-r from-purple-50/50 to-white">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        <h4 className="font-medium text-gray-900">Request New Leave</h4>
      </div>
      <form action={dispatch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <Input
              type="date"
              id="startDate"
              name="startDate"
              required
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
            {state?.errors?.startDate && <p className="text-red-500 text-sm mt-1">{state.errors.startDate[0]}</p>}
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <Input
              type="date"
              id="endDate"
              name="endDate"
              required
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
            {state?.errors?.endDate && <p className="text-red-500 text-sm mt-1">{state.errors.endDate[0]}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
            Reason *
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            required
            className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Please provide a reason for your leave request..."
          />
          {state?.errors?.reason && <p className="text-red-500 text-sm mt-1">{state.errors.reason[0]}</p>}
        </div>
        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          Submit Leave Request
        </Button>
        {state?.message && (
          <div
            className={`text-sm p-3 rounded-lg ${state.message.includes("successfully")
                ? "text-green-700 bg-green-50 border border-green-200"
                : "text-red-700 bg-red-50 border border-red-200"
              }`}
          >
            {state.message}
          </div>
        )}
      </form>
    </div>
  )
}
