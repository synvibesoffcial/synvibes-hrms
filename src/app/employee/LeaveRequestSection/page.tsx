"use client";
import { useState } from "react";
import { requestLeave } from "../empActions";

interface Leave {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string;
  status: string;
}

interface Employee {
  id: string;
  leaves: Leave[];
}

export default function LeaveRequestSection({ employee }: { employee: Employee }) {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestLeave(employee.id, form);
      window.location.reload();
    } catch (error) {
      console.error("Error requesting leave:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-4 rounded">
      <h2 className="font-bold text-lg mb-2">Request Leave</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-1">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={form.startDate}
            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
            min={new Date().toISOString().split("T")[0]}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={form.endDate}
            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
            min={form.startDate || new Date().toISOString().split("T")[0]}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="reason" className="block text-sm font-medium mb-1">
            Reason
          </label>
          <input
            id="reason"
            type="text"
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="Enter reason for leave"
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Requesting..." : "Request Leave"}
        </button>
      </form>
      <h3 className="font-bold mt-4">Leave History</h3>
      <ul className="space-y-2">
        {employee.leaves.map(leave => (
          <li key={leave.id} className="p-2 border rounded">
            <div className="font-medium">
              {new Date(leave.startDate).toLocaleDateString()} to{" "}
              {new Date(leave.endDate).toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-600">Reason: {leave.reason}</div>
            <div className="text-sm">
              Status:{" "}
              <span className={`font-medium ${
                leave.status === "approved" ? "text-green-600" :
                leave.status === "rejected" ? "text-red-600" :
                "text-yellow-600"
              }`}>
                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
