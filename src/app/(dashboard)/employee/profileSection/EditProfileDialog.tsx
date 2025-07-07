"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit } from "lucide-react"
import { updateEmployeeProfile } from "@/actions/employee"
import { useRouter } from "next/navigation"
import type { Employee } from "@prisma/client"

interface EditProfileDialogProps {
  employee: Employee
}

export function EditProfileDialog({ employee }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: employee.firstName,
    lastName: employee.lastName,
    designation: employee.designation || "",
    joinDate: employee.joinDate.toISOString().split('T')[0],
    dateOfBirth: employee.dateOfBirth.toISOString().split('T')[0],
    gender: employee.gender,
    address: employee.address || "",
    contactInfo: employee.contactInfo || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await updateEmployeeProfile(employee.userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        joinDate: formData.joinDate,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        contactInfo: formData.contactInfo,
      })

      if (result.success) {
        setSuccess("Profile updated successfully!")
        setTimeout(() => {
          setOpen(false)
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || "Failed to update profile")
      }
         } catch {
       setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Designation</label>
              <Input
                value={formData.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                placeholder="Enter designation"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Join Date</label>
              <Input
                type="date"
                value={formData.joinDate}
                onChange={(e) => handleInputChange("joinDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth</label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Info</label>
              <Input
                value={formData.contactInfo}
                onChange={(e) => handleInputChange("contactInfo", e.target.value)}
                placeholder="Phone number or email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Full address"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 