"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WorkingHours } from "@/lib/working-hours";
import { WorkingHoursInput } from "./working-hours-input";

const DEFAULT_HOURS: Partial<WorkingHours> = {
  mon: { start: "09:00", end: "17:00" },
  tue: { start: "09:00", end: "17:00" },
  wed: { start: "09:00", end: "17:00" },
  thu: { start: "09:00", end: "17:00" },
  fri: { start: "09:00", end: "17:00" },
};

export function AddDoctorForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    bio: "",
    slotDurationMinutes: 30,
  });
  const [workingHours, setWorkingHours] = useState<Partial<WorkingHours>>(DEFAULT_HOURS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/admin/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, workingHours }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create doctor");
      return;
    }

    setForm({ name: "", email: "", password: "", specialization: "", bio: "", slotDurationMinutes: 30 });
    setWorkingHours(DEFAULT_HOURS);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white"
      >
        + Add doctor
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded border p-4">
      <h3 className="font-medium">New doctor</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Specialization</label>
          <input
            required
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Temp password</label>
          <input
            type="text"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slot duration (min)</label>
          <input
            type="number"
            min={5}
            max={240}
            required
            value={form.slotDurationMinutes}
            onChange={(e) =>
              setForm({ ...form, slotDurationMinutes: Number(e.target.value) })
            }
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Bio (optional)</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full rounded border px-3 py-2"
          rows={2}
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Working hours</label>
        <WorkingHoursInput value={workingHours} onChange={setWorkingHours} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create doctor"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded border px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
