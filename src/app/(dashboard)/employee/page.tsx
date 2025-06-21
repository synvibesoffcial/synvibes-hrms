import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import { getUserById, getEmployeeByUserId } from '@/lib/dal';
import { redirect } from 'next/navigation';
import EmployeeOnboardingForm from '@/components/ui/EmployeeOnboardingForm';
import { User } from '@/generated/prisma/index.d';

export default async function EmployeePage() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId || session?.role !== 'employee') {
    redirect('/sign-in');
  }

  const user = await getUserById(session.userId as string);

  if (!user) {
    redirect('/sign-in');
  }

  const employee = await getEmployeeByUserId(user.id);

  if (employee) {
    redirect('/employee/dashboard');
  }

  return <EmployeeOnboardingForm user={user as User} />;
}