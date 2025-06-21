'use client';

import { useActionState } from 'react';
import { createLeaveRequest } from './employeeActions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LeaveRequestFormProps {
  employeeId: string;
}

export default function LeaveRequestForm({ employeeId }: LeaveRequestFormProps) {
  const initialState = { message: '', errors: {} };
  const createLeaveRequestWithId = createLeaveRequest.bind(null, employeeId);
  const [state, dispatch] = useActionState(createLeaveRequestWithId, initialState);

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h4 className="font-medium mb-4">Request New Leave</h4>
      <form action={dispatch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <Input
              type="date"
              id="startDate"
              name="startDate"
              required
              className="w-full"
            />
            {state?.errors?.startDate && (
              <p className="text-red-500 text-sm mt-1">{state.errors.startDate[0]}</p>
            )}
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              End Date
            </label>
            <Input
              type="date"
              id="endDate"
              name="endDate"
              required
              className="w-full"
            />
            {state?.errors?.endDate && (
              <p className="text-red-500 text-sm mt-1">{state.errors.endDate[0]}</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium mb-1">
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Please provide a reason for your leave request..."
          />
          {state?.errors?.reason && (
            <p className="text-red-500 text-sm mt-1">{state.errors.reason[0]}</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Submit Leave Request
        </Button>
        {state?.message && (
          <p className={`text-sm ${state.message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
            {state.message}
          </p>
        )}
      </form>
    </div>
  );
}
