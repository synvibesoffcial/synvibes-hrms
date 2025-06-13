import prisma from './db';
import { Role } from '../../src/generated/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function checkAndCreateUser() {
  const user = await currentUser();
  if (!user) return null;

  // Map Clerk user fields to your User table fields
  const id = user.id;
  const email = user.emailAddresses?.[0]?.emailAddress || '';
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const username = user.username || undefined;
  // Default to 'null' if no role is set in publicMetadata
  const role = (user.publicMetadata?.role as Role) ?? null;

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { id } });
  if (existing) return existing;

  // Create new user
  return await prisma.user.create({
    data: {
      id,
      email,
      firstName,
      lastName,
      username,
      role,
    },
  });
} 