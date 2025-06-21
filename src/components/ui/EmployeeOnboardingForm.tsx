'use client';

import { useActionState } from 'react';
import { createEmployee } from '@/actions/employee';
import { Input } from './input';
import { Button } from './button';
import { User } from '@/generated/prisma/index.d';

export default function EmployeeOnboardingForm({ user }: { user: User }) {
  const initialState = { message: null, errors: {} };
  const createEmployeeWithUser = createEmployee.bind(null, user);
  const [state, dispatch] = useActionState(createEmployeeWithUser, initialState);

  return (
    <div className="flex items-center justify-center h-full">
      <form action={dispatch} className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.firstName}!</h1>
          <p className="text-gray-600">Please complete your employee profile.</p>
        </div>
        
        <div className="space-y-4">
          <Input name="empId" placeholder="Employee ID" required />
          <Input name="joinDate" type="date" required />
          <Input name="dateOfBirth" type="date" required />
          <Input name="gender" placeholder="Gender" required />
          <Input name="address" placeholder="Address" />
          <Input name="contactInfo" placeholder="Contact Information" />
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>

        {state.message && <p className="text-sm text-red-500">{state.message}</p>}
      </form>
    </div>
  );
}
