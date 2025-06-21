import { getAllUsers } from "@/actions/auth";
import SuperAdminUserTable from "./S_adminUserTable";

export default async function AdminPage() {
  const users = await getAllUsers();
  return <SuperAdminUserTable users={users} />;
}