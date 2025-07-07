"use server";
import prisma from "@/lib/db";
import { sendInvitationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { verifySession } from "@/lib/dal";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";

type Role = "superadmin" | "admin" | "hr" | "employee";

export interface InvitationFormData {
  email: string;
  role: Role;
}

export interface CreateInvitationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function createInvitation(
  email: string,
  role: Role
): Promise<CreateInvitationResult> {
  try {
    // Verify session and get current user
    const session = await verifySession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user has permission to send invitations (admin or superadmin)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { role: true, firstName: true, lastName: true }
    });

    if (!currentUser || !['admin', 'superadmin'].includes(currentUser.role || '')) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Check if email already exists as a user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.userInvitation.findUnique({
      where: { email },
    });

    if (existingInvitation && existingInvitation.status === 'PENDING') {
      // Delete old invitation and create new one
      await prisma.userInvitation.delete({
        where: { email },
      });
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex');
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation record
    const invitation = await prisma.userInvitation.create({
      data: {
        email,
        role,
        token,
        invitedBy: session.userId as string,
        expiresAt,
        status: 'PENDING',
      },
    });

    // Send invitation email
    const emailResult = await sendInvitationEmail({
      recipientEmail: email,
      inviterName: `${currentUser.firstName} ${currentUser.lastName}`,
      role: role.charAt(0).toUpperCase() + role.slice(1),
      invitationToken: token,
    });

    if (!emailResult.success) {
      // If email fails, delete the invitation record
      await prisma.userInvitation.delete({
        where: { id: invitation.id },
      });
      return { success: false, error: `Failed to send invitation email: ${emailResult.error}` };
    }

    return { success: true, message: "Invitation sent successfully" };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return { success: false, error: "Failed to create invitation" };
  }
}

export async function getPendingInvitations() {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const invitations = await prisma.userInvitation.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          gt: new Date(), // Only non-expired invitations
        },
      },
      include: {
        invitedByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        invitedAt: 'desc',
      },
    });

    return invitations.map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      invitedAt: invitation.invitedAt,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
      invitedBy: `${invitation.invitedByUser.firstName} ${invitation.invitedByUser.lastName}`,
    }));
  } catch (error) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
}

export async function getInvitationByToken(token: string) {
  try {
    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
      include: {
        invitedByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!invitation) {
      return { error: "Invalid invitation token" };
    }

    if (invitation.status === 'ACCEPTED') {
      return { error: "This invitation has already been accepted" };
    }

    if (invitation.status === 'CANCELLED') {
      return { error: "This invitation has been cancelled" };
    }

    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      await prisma.userInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      return { error: "This invitation has expired" };
    }

    return {
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        invitedBy: `${invitation.invitedByUser.firstName} ${invitation.invitedByUser.lastName}`,
        expiresAt: invitation.expiresAt,
      },
    };
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return { error: "Failed to validate invitation" };
  }
}

export async function acceptInvitation(
  token: string,
  userData: {
    firstName: string;
    lastName: string;
    password: string;
  }
) {
  try {
    // Validate invitation
    const invitationResult = await getInvitationByToken(token);
    if (!invitationResult.success || !invitationResult.invitation) {
      return { success: false, error: invitationResult.error };
    }

    const { invitation } = invitationResult;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user and mark invitation as accepted in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: hashedPassword,
          role: invitation.role as Role,
          emailVerified: true, // Set email as verified since invitation serves as verification
        },
      });

      // Mark invitation as accepted
      await tx.userInvitation.update({
        where: { token },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          userId: user.id,
        },
      });

      return user;
    });

    // Create session for the new user
    const sessionData = {
      userId: result.id,
      email: result.email,
      role: result.role,
      emailVerified: true,
    };

    const sessionToken = await encrypt(sessionData);
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return { 
      success: true, 
      message: "Account created successfully", 
      userId: result.id,
      redirectPath: `/employee`
    };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function deleteInvitation(invitationId: string) {
  try {
    const session = await verifySession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user has permission
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { role: true }
    });

    if (!currentUser || !['admin', 'superadmin'].includes(currentUser.role || '')) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Mark invitation as cancelled instead of deleting
    await prisma.userInvitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' },
    });

    return { success: true, message: "Invitation cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    return { success: false, error: "Failed to cancel invitation" };
  }
} 