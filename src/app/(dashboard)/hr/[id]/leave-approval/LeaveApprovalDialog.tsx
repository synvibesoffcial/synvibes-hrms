'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { CheckCircle, XCircle, AlertTriangle, Calendar } from "lucide-react"
import { approveLeaveRequest, rejectLeaveRequest } from "@/actions/hr"

type LeaveRequest = {
  id: string
  startDate: Date
  endDate: Date
  reason: string
  status: string
  createdAt: Date
}

type LeaveApprovalDialogProps = {
  leave: LeaveRequest
  action: 'approve' | 'reject'
  employeeName: string
}

export default function LeaveApprovalDialog({ leave, action, employeeName }: LeaveApprovalDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')

  const handleAction = async () => {
    setIsProcessing(true)
    setError('')
    
    try {
      const result = action === 'approve' 
        ? await approveLeaveRequest(leave.id)
        : await rejectLeaveRequest(leave.id)
      
      if (result.success) {
        setIsOpen(false)
      } else {
        setError(result.message)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  };

  const calculateDays = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={action === 'approve' 
            ? "text-green-600 border-green-200 hover:bg-green-50"
            : "text-red-600 border-red-200 hover:bg-red-50"
          }
        >
          {action === 'approve' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${
            action === 'approve' ? 'text-green-600' : 'text-red-600'
          }`}>
            {action === 'approve' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            {action === 'approve' ? 'Approve' : 'Reject'} Leave Request
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Leave Details */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Leave Details
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Employee: </span>
                <span className="text-gray-900">{employeeName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Duration: </span>
                <span className="text-gray-900">
                  {formatDateRange(leave.startDate, leave.endDate)} ({calculateDays(leave.startDate, leave.endDate)} days)
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Reason: </span>
                <span className="text-gray-900">{leave.reason}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Requested: </span>
                <span className="text-gray-900">{new Date(leave.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Warning */}
          <div className={`p-4 border rounded-lg ${
            action === 'approve' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                action === 'approve' ? 'text-green-600' : 'text-red-600'
              }`} />
              <div>
                <p className={`text-sm font-medium ${
                  action === 'approve' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {action === 'approve' ? 'Approve this leave request?' : 'Reject this leave request?'}
                </p>
                <p className={`text-sm mt-1 ${
                  action === 'approve' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {action === 'approve' 
                    ? 'The employee will be notified that their leave has been approved.'
                    : 'The employee will be notified that their leave has been rejected.'
                  }
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleAction}
              className={action === 'approve' 
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
              }
              disabled={isProcessing}
            >
              {isProcessing 
                ? (action === 'approve' ? 'Approving...' : 'Rejecting...') 
                : (action === 'approve' ? 'Approve Leave' : 'Reject Leave')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 