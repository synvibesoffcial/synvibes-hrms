'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Trash2, AlertTriangle } from "lucide-react"
import { deleteTeam } from "@/actions/hr"

type DeleteTeamButtonProps = {
  teamId: string
  teamName: string
  hasEmployees: boolean
}

export default function DeleteTeamButton({ 
  teamId, 
  teamName, 
  hasEmployees 
}: DeleteTeamButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')
    
    try {
      const result = await deleteTeam(teamId)
      
      if (result.success) {
        setIsOpen(false)
      } else {
        setError(result.message)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 border-red-200 hover:bg-red-50"
          disabled={hasEmployees}
          title={hasEmployees ? "Cannot delete team with assigned employees" : "Delete team"}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Team
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. Are you sure you want to delete the team &quot;{teamName}&quot;?
            </p>
          </div>

          {hasEmployees && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                This team cannot be deleted because it has assigned employees. Please reassign all employees first.
              </p>
            </div>
          )}

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
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting || hasEmployees}
            >
              {isDeleting ? 'Deleting...' : 'Delete Team'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 