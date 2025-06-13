"use client";
import { useState } from "react";

export default function EmployeeDetailsForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [form, setForm] = useState({
    department: "",
    position: "",
    joinDate: "",
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
