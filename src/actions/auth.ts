"use server";
import prisma from "@/lib/db";
import { SignupFormSchema, SigninFormSchema, type FormState } from "@/lib/definitions";
import { encrypt } from "@/lib/session";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { deleteSession } from '@/lib/session';
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

const roleBasedRedirects: Record<string, string> = {
  superadmin: '/superadmin',
  admin: '/admin',
  hr: '/hr',
  employee: '/employee',
};

export async function signup(prevState: FormState, formData: FormData): Promise<FormState & { success?: boolean; redirectPath?: string }> {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { name, email, password } = validatedFields.data;
  
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "Email already in use." };
  }
  
  // Hash password
  const hashed = await bcrypt.hash(password, 10);
  
  // Split name
  const [firstName, ...rest] = name.split(" ");
  const lastName = rest.join(" ");
  
  // Generate email verification token
  const verificationToken = randomBytes(32).toString('hex');
  const verificationExpires = new Date();
  verificationExpires.setHours(verificationExpires.getHours() + 24); // Expires in 24 hours
  
  // Create user with email verification fields
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      role: null, // Explicitly set role as null
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    },
  });
  
  // Send verification email
  const emailResult = await sendVerificationEmail({
    recipientEmail: email,
    recipientName: firstName,
    verificationToken,
  });
  
  if (!emailResult.success) {
    // If email fails, still create the user but inform them about the issue
    console.error('Failed to send verification email:', emailResult.error);
  }
  
  // Don't create session - user must verify email first
  return {
    success: true,
    redirectPath: "/verify-email-sent",
  };
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string; redirectPath?: string }> {
  try {
    // First, check if a user exists with this token (regardless of verification status)
    const userWithToken = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    // If no user found with this token, it's invalid
    if (!userWithToken) {
      return {
        success: false,
        message: "Invalid verification token. Please request a new verification email.",
      };
    }
    // Check if user is already verified
    if (userWithToken.emailVerified) {
      return {
        success: true,
        message: "Your email is already verified! You can sign in to your account.",
        redirectPath: "/",
      };
    }

    // Check if token has expired
    if (!userWithToken.emailVerificationExpires || userWithToken.emailVerificationExpires <= new Date()) {
      return {
        success: false,
        message: "Verification token has expired. Please request a new verification email.",
      };
    }

    const user = userWithToken;

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Update session to include emailVerified flag
    const session = await encrypt({ 
      userId: user.id, 
      role: user.role, 
      emailVerified: true 
    });
    const cookieStore = await cookies();
    cookieStore.set("session", session, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      message: "Email verified successfully! You can now access your account.",
      redirectPath: user.role && roleBasedRedirects[user.role] ? roleBasedRedirects[user.role] : '/user',
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      message: "An error occurred during email verification. Please try again.",
    };
  }
}

export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "No account found with this email address.",
      };
    }

    if (user.emailVerified) {
      return {
        success: false,
        message: "Email is already verified.",
      };
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail({
      recipientEmail: email,
      recipientName: user.firstName,
      verificationToken,
    });

    if (!emailResult.success) {
      return {
        success: false,
        message: "Failed to send verification email. Please try again later.",
      };
    }

    return {
      success: true,
      message: "Verification email sent successfully! Please check your inbox.",
    };
  } catch (error) {
    console.error('Resend verification email error:', error);
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    };
  }
}

export async function signin(prevState: FormState, formData: FormData): Promise<FormState & { success?: boolean; redirectPath?: string }> {
  // Validate form fields
  const validatedFields = SigninFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { email, password } = validatedFields.data;
  
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: "Invalid email or password." };
  }
  
  // Check password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { message: "Invalid email or password." };
  }
  
  // Check if email is verified
  if (!user.emailVerified) {
    return { 
      message: "Please verify your email address before signing in. Check your inbox for the verification link.",
    };
  }
  
  // Create session
  const session = await encrypt({ 
    userId: user.id, 
    role: user.role, 
    emailVerified: user.emailVerified 
  });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  const redirectPath = user.role && roleBasedRedirects[user.role] ? roleBasedRedirects[user.role] : '/user';
  
  return {
    success: true,
    redirectPath,
  };
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateUserRole(userId: string, newRole: Role) {
  // Update role in DB
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });
  // If the user is the current session user, update their session cookie
  const cookieStore = await cookies();
  const session = (await cookieStore).get("session")?.value;
  if (session) {
    const payload = await (await import("@/lib/session")).decrypt(session);
    if (payload && payload.userId === userId) {
      const newSession = await encrypt({ userId, role: newRole });
      (await cookieStore).set("session", newSession, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
  }
  return user;
} 

export async function logout() {
  await deleteSession()
  redirect('/')
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        success: true,
        message: "If an account with that email exists, you will receive a password reset link shortly.",
      };
    }

    // Generate password reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expires in 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail({
      recipientEmail: email,
      recipientName: user.firstName,
      resetToken,
    });

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return {
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      };
    }

    return {
      success: true,
      message: "If an account with that email exists, you will receive a password reset link shortly.",
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    };
  }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string; redirectPath?: string }> {
  try {
    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(), // Token hasn't expired
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired password reset token. Please request a new password reset.",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user with new password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return {
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
      redirectPath: "/sign-in",
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: "An error occurred during password reset. Please try again.",
    };
  }
}