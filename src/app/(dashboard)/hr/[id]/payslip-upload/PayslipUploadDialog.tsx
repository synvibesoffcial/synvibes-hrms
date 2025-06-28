'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Upload, FileText } from "lucide-react"
import { uploadPayslip } from "@/actions/hr"
import { PayslipUploadSchema, type PayslipUploadFormData } from "./schemas"

type PayslipUploadDialogProps = {
  employeeId: string
  employeeName: string
  onSuccess?: () => void
}

export default function PayslipUploadDialog({ employeeId, employeeName, onSuccess }: PayslipUploadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [serverMessage, setServerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PayslipUploadFormData>({
    resolver: zodResolver(PayslipUploadSchema),
    defaultValues: {
      month: "",
      year: "",
    },
  })

  const selectedMonth = watch("month")
  const selectedYear = watch("year")

  const months = [
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const onSubmit = async (data: PayslipUploadFormData) => {
    setIsSubmitting(true)
    setServerMessage(null)

    try {
      const formData = new FormData()
      formData.append("month", data.month)
      formData.append("year", data.year)
      formData.append("file", data.file)

      const result = await uploadPayslip(employeeId, {}, formData)
      
      if (result?.success) {
        setServerMessage({ text: result.message || 'Payslip uploaded successfully!', type: 'success' })
        reset()
        if (fileInputRef.current) fileInputRef.current.value = ""
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
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue("file", file)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Upload Payslip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-900">
            <FileText className="w-5 h-5" />
            Upload Payslip
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  Month <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={selectedMonth} 
                  onValueChange={(value) => setValue("month", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.month && (
                  <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={selectedYear} 
                  onValueChange={(value) => setValue("year", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Payslip File <span className="text-red-500">*</span>
              </label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </p>
              {errors.file && (
                <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
              )}
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Please ensure the payslip file is clear and readable. 
                The file will be available for the employee to download from their dashboard.
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
                disabled={isSubmitting || !selectedMonth || !selectedYear}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Payslip'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 