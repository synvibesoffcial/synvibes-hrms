"use server"
//invitation does not work for some reason, figure out later
import { createClerkClient } from '@clerk/nextjs/server'

export async function inviteUser(formData: FormData) {
  const email = formData.get('email') as string
  const role = formData.get('role') as string

  if (!email || !role) {
    return { message: 'Email and role are required.' }
  }

  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

  try {
    await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGNUP_REDIRECT_URL,
      publicMetadata: {
        role,
      },
    })
    return { message: `Invitation sent to ${email}` }
  } catch (err: unknown) {
    let message = 'Failed to send invitation.'
    if (err && typeof err === 'object' && 'message' in err) {
      message = (err as { message: string }).message
    }
    return { message }
  }
} 