export default function EmployeeProfile({ employee }) {
  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold text-lg mb-2">Profile</h2>
      <div>Department: {employee.department}</div>
      <div>Position: {employee.position}</div>
      <div>Join Date: {new Date(employee.joinDate).toLocaleDateString()}</div>
      <div>Contact Info: {employee.contactInfo || "N/A"}</div>
    </div>
  );
}
