import type { Employee } from "../page";

export default function EmployeeProfile({ employee }: { employee: Employee }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold text-lg mb-2">Profile</h2>
      <div><b>Employee ID:</b> {employee.empId}</div>
      <div><b>System Role:</b> {employee.systemRole}</div>
      <div><b>Name:</b> {employee.firstName} {employee.lastName}</div>
      <div><b>Date of Birth:</b> {employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : "N/A"}</div>
      <div><b>Gender:</b> {employee.gender || "N/A"}</div>
      <div><b>Department:</b> {employee.department}</div>
      <div><b>Position:</b> {employee.position}</div>
      <div><b>Join Date:</b> {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : "N/A"}</div>
      <div><b>Address:</b> {employee.address || "N/A"}</div>
      <div><b>Contact Info:</b> {employee.contactInfo || "N/A"}</div>
    </div>
  );
}
