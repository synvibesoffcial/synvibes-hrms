import { redirect } from 'next/navigation'

export default function CreateTeamPage() {
  // Redirect to the main team management page where the create form is in a modal
  redirect('/hr/team-management')
}
