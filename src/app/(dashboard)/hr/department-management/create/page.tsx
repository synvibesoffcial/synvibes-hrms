import { redirect } from 'next/navigation'

export default function CreateDepartmentPage() {
  // Redirect to the main department management page where the create form is in a modal
  redirect('/hr/department-management')
}
