import { z } from "zod"

// Department validation schema
export const DepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required").trim(),
  description: z.string().optional(),
})

// Team validation schema  
export const TeamSchema = z.object({
  name: z.string().min(1, "Team name is required").trim(),
  description: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
})

// Add employees to team validation schema
export const AddEmployeesToTeamSchema = z.object({
  employeeIds: z.array(z.string()).min(1, "At least one employee must be selected"),
})

export type DepartmentFormData = z.infer<typeof DepartmentSchema>
export type TeamFormData = z.infer<typeof TeamSchema>
export type AddEmployeesToTeamFormData = z.infer<typeof AddEmployeesToTeamSchema> 