'use server'

import { checkRole } from '../../../utils/roles'
import { clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { Role } from '@/generated/prisma'

export async function setRole(formData: FormData) {
  const client = await clerkClient()

  // Check that the user trying to set the role is an admin
  if (!checkRole('admin')) {
    return { message: 'Not Authorized' }
  }

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: formData.get('role') },
    });
    // dataase update
    await prisma.user.update({
      where: { id: formData.get('id') as string },
      data: { role: formData.get('role') as Role },
    });
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}

export async function removeRole(formData: FormData) {
  const client = await clerkClient()

  try {
    const res = await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: null },
    })
    return { message: res.publicMetadata }
  } catch (err) {
    return { message: err }
  }
}