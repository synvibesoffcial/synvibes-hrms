import { verifySession } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { Role } from '@/generated/prisma';

type SessionPayload = { userId: string; role: Role | null };

export default async function UserPage() {
  const session = (await verifySession()) as SessionPayload | null;

  if (!session?.userId) {
    redirect('/sign-in');
  }

  // Middleware ensures users with roles are redirected, so this page is only for users with no role
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-yellow-600 mb-4">Waiting for admin to assign your role...</h1>
      <p className="text-gray-600">You can log out and check back later.</p>
    </div>
  );
}