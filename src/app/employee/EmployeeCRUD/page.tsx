"use client";
import { useState } from "react";
import { updateEmployee, deleteEmployee } from "../empActions";

export default function EmployeeCRUD({ employee }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    department: employee.department,
    position: employee.position,
    joinDate: employee.joinDate,
    contactInfo: employee.contactInfo || "",
  });

  if (editing) {
    return (
      <form
        className="border p-4 rounded mb-4"
        onSubmit={async e => {
          e.preventDefault();
          await updateEmployee(employee.id, form);
          setEditing(false);
          window.location.reload();
        }}
      >
        <h2 className="font-bold text-lg mb-2">Edit Profile</h2>
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
          value={form.joinDate}
          onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))}
          required
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
