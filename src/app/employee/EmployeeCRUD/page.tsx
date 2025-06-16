"use client";
import { useState } from "react";
import { updateEmployee, deleteEmployee } from "../actions";
import type { Employee } from "../page";

export default function EmployeeCRUD({ employee }: { employee: Employee }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    empId: employee.empId,
    systemRole: employee.systemRole,
    firstName: employee.firstName,
    lastName: employee.lastName,
    department: employee.department,
    position: employee.position,
    joinDate: employee.joinDate,
    dateOfBirth: employee.dateOfBirth,
    gender: employee.gender || "",
    address: employee.address || "",
    contactInfo: employee.contactInfo || "",
  });

  if (editing) {
    return (
      <form
        className="border p-4 rounded mb-4"
        onSubmit={async e => {
          e.preventDefault();
          await updateEmployee(employee.id, {
            ...form,
            joinDate: form.joinDate instanceof Date ? form.joinDate.toISOString() : form.joinDate,
            dateOfBirth: form.dateOfBirth instanceof Date ? form.dateOfBirth.toISOString() : form.dateOfBirth,
          });
          setEditing(false);
          window.location.reload();
        }}
      >
        <h2 className="font-bold text-lg mb-2">Edit Profile</h2>
        <input
          type="text"
          value={form.empId}
          onChange={e => setForm(f => ({ ...f, empId: e.target.value }))}
          placeholder="Employee ID"
          required
        />
        <select
          value={form.systemRole}
          onChange={e => setForm(f => ({ ...f, systemRole: e.target.value as Employee["systemRole"] }))}
          required
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="employee">Employee</option>
        </select>
        <input
          type="text"
          value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          placeholder="Last Name"
          required
        />
        <input
          type="date"
          value={form.dateOfBirth ? (form.dateOfBirth instanceof Date ? form.dateOfBirth.toISOString().slice(0, 10) : form.dateOfBirth.slice(0, 10)) : ""}
          onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
          required
        />
        <select
          value={form.gender}
          onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          value={form.department}
          onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
          placeholder="Department"
          required
        />
        <input
          type="text"
          value={form.position}
          onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
          placeholder="Position"
          required
        />
        <input
          type="date"
          value={form.joinDate ? (form.joinDate instanceof Date ? form.joinDate.toISOString().slice(0, 10) : form.joinDate.slice(0, 10)) : ""}
          onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))}
          required
        />
        <input
          type="text"
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          placeholder="Address"
        />
        <input
          type="text"
          value={form.contactInfo}
          onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))}
          placeholder="Contact Info"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Save</button>
        <button type="button" onClick={() => setEditing(false)}>Cancel</button>
      </form>
    );
  }

  return (
    <div className="mb-4">
      <button className="bg-yellow-500 text-white px-4 py-2 rounded mr-2" onClick={() => setEditing(true)}>
        Edit Profile
      </button>
      <button
        className="bg-red-600 text-white px-4 py-2 rounded"
        onClick={async () => {
          if (confirm("Are you sure you want to delete your profile?")) {
            await deleteEmployee(employee.id);
            window.location.href = "/";
          }
        }}
      >
        Delete Profile
      </button>
    </div>
  );
}
