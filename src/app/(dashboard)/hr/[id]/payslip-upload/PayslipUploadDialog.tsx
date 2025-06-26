'use client'

import { useState, useEffect } from 'react'
import { useFormState } from 'react-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Upload, FileText } from "lucide-react"
import { uploadPayslip } from "@/actions/hr"

type PayslipUploadDialogProps = {
  employeeId: string
  employeeName: string
}

export default function PayslipUploadDialog({ employeeId, employeeName }: PayslipUploadDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  const action = uploadPayslip.bind(null, employeeId)
  const [state, formAction] = useFormState(action, {
    errors: {},
    message: '',
    success: false,
  })

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    formData.set('month', selectedMonth)
    formData.set('year', selectedYear)
    await formAction(formData)
    setIsSubmitting(false)
  }

  // Handle success after state update
  useEffect(() => {
    if (state.success && isOpen) {
      setSelectedMonth('')
      setSelectedYear('')
      setIsOpen(false)
    }
  }, [state.success, isOpen])

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  Month <span className="text-red-500">*</span>
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
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
              </div>
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                Payslip File <span className="text-red-500">*</span>
              </label>
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, JPG, PNG (Max 10MB)
              </p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Please ensure the payslip file is clear and readable. 
                The file will be available for the employee to download from their dashboard.
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