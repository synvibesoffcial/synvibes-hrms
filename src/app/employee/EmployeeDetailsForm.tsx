"use client";
import { useState } from "react";

export default function EmployeeDetailsForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({
    empId: "",
    firstName: "",
    lastName: "",
    department: "",
    position: "",
    joinDate: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    contactInfo: "",
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="flex flex-col gap-4 max-w-md mx-auto"
    >
      <input
        type="text"
        placeholder="Employee ID"
        value={form.empId}
        onChange={e => setForm(f => ({ ...f, empId: e.target.value }))}
        required
      />
      <input
        type="text"
        placeholder="First Name"
        value={form.firstName}
        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
        required
      />
      <input
        type="text"
        placeholder="Last Name"
        value={form.lastName}
        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
        required
      />
      <input
        type="date"
        placeholder="Date of Birth"
        value={form.dateOfBirth}
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
        placeholder="Department"
        value={form.department}
        onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
        required
      />
      <input
        type="text"
        placeholder="Position"
        value={form.position}
        onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
        required
      />
      <input
        type="date"
        placeholder="Join Date"
        value={form.joinDate}
        onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))}
        required
      />
      <input
        type="text"
        placeholder="Address"
        value={form.address}
        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
      />
      <input
        type="text"
        placeholder="Contact Info"
        value={form.contactInfo}
        onChange={e => setForm(f => ({ ...f, contactInfo: e.target.value }))}
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}
