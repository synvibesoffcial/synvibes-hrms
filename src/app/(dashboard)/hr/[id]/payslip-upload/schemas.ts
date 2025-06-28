import { z } from "zod"

// Payslip upload validation schema
export const PayslipUploadSchema = z.object({
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "File is required")
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB
      "File size must be less than 10MB"
    )
    .refine(
      (file) => {
        const allowedTypes = [
          "application/pdf",
          "image/jpeg", 
          "image/jpg",
          "image/png"
        ]
        return allowedTypes.includes(file.type)
      },
      "Only PDF, JPG, and PNG files are allowed"
    ),
})

export type PayslipUploadFormData = z.infer<typeof PayslipUploadSchema> 