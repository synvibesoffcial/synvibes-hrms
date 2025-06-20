"use server";
import prisma from "@/lib/db";
import { SignupFormSchema, SigninFormSchema, type FormState } from "@/lib/definitions";
import { encrypt } from "@/lib/session";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { Role } from "@/generated/prisma";
import { redirect } from "next/navigation";
import { deleteSession } from '@/lib/session';


export async function signup(prevState: FormState, formData: FormData): Promise<FormState | void> {
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
  // Create user with role as null
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      role: null, // Explicitly set role as null
    },
  });
  // Create session with role as null
  const session = await encrypt({ userId: user.id, role: null });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  redirect("/user");
}

export async function signin(prevState: FormState, formData: FormData): Promise<FormState | void> {
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
  // Create session
  const session = await encrypt({ userId: user.id, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  redirect("/user");
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