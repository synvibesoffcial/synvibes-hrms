import { getAllUsers } from "@/actions/auth";
import AdminUserTable from "./AdminUserTable";

export default async function AdminPage() {
  const users = await getAllUsers();
  return <AdminUserTable users={users} />;
}