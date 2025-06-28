import { z } from "zod"

// Attendance validation schema with business logic
export const AttendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
}).refine(
  (data) => {
    // If check-out is provided, check-in must also be provided
    if (data.checkOut && !data.checkIn) {
      return false
    }
    return true
  },
  {
    message: "Check-in time is required when check-out time is provided",
    path: ["checkIn"],
  }
).refine(
  (data) => {
    // If both times are provided, check-out must be after check-in
    if (data.checkIn && data.checkOut) {
      const checkInTime = new Date(`2000-01-01T${data.checkIn}:00`)
      const checkOutTime = new Date(`2000-01-01T${data.checkOut}:00`)
      return checkOutTime > checkInTime
    }
    return true
  },
  {
    message: "Check-out time must be after check-in time",
    path: ["checkOut"],
  }
)

export type AttendanceFormData = z.infer<typeof AttendanceSchema> 