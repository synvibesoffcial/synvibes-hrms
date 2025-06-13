// import { checkRole } from "../../utils/roles";
import { redirect } from "next/navigation";
import { checkAndCreateUser } from "@/lib/checkuser";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  await checkAndCreateUser();
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.sub;

  if (!userId) {
    // if not signed in, show sign in or redirect as needed
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
          <h1 className="text-xl font-bold">
            Welcome to HRMS
          </h1>
          <h1 className="text-3xl font-bold text-yellow-500">
            Please sign in
          </h1>
      </div>
    );
  }

  // if role alloted then redirect to the respective page
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.role === "hr") {
    redirect("/hr");
  } else if (user?.role === "employee") {
    redirect("/employee");
  } else if (user?.role === "admin") {
    redirect("/admin");
  }

  // If no role, show waiting message
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-yellow-500">
        Waiting for approval from admin
      </h1>
    </div>
  );
}
