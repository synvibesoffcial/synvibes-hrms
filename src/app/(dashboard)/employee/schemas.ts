import { z } from 'zod';

export const LeaveRequestSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(1, 'Reason is required'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
}).refine((data) => {
  const start = new Date(data.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return start >= today;
}, {
  message: 'Start date cannot be in the past',
  path: ['startDate'],
});

export type FormState = {
  errors?: {
    startDate?: string[];
    endDate?: string[];
    reason?: string[];
  };
  message?: string;
  success?: boolean;
}; 