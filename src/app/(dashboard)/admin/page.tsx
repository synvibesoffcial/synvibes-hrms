import { getAllUsers } from "@/actions/auth";
import AdminUserTable from "./AdminUserTable";

export default async function AdminPage() {
  const allUsers = await getAllUsers();
  const users = allUsers.filter(user => user.role !== 'superadmin');
  return <AdminUserTable users={users} />;
}