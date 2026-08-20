"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DAY_KEYS, DayKey, WorkingHours } from "@/lib/working-hours";

type Leave = { id: string; date: string; reason: string | null };

export type DoctorWithLeaves = {
  id: string;
  specialization: string;
  slotDurationMinutes: number;
  workingHours: WorkingHours;
  user: { name: string; email: string };
  leaves: Leave[];
};

const DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

function formatWorkingHours(wh: WorkingHours) {
  return DAY_KEYS.filter((d) => wh[d])
    .map((d) => `${DAY_LABELS[d]} ${wh[d]!.start}–${wh[d]!.end}`)
    .join(", ");
}

export function DoctorCard({ doctor }: { doctor: DoctorWithLeaves }) {
  const router = useRouter();
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function addLeave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const res = await fetch(`/api/admin/doctors/${doctor.id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: leaveDate, reason: leaveReason || undefined }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to mark leave");
      return;
    }
    const data = await res.json();
    if (data.cancelledCount > 0) {
      setNotice(
        `${data.cancelledCount} existing appointment(s) on this date were cancelled and affected patients queued for notification.`
      );
    }
    setLeaveDate("");
    setLeaveReason("");
    router.refresh();
  }

  async function removeLeave(leaveId: string) {
    await fetch(`/api/admin/doctors/${doctor.id}/leave/${leaveId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="rounded border p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium">{doctor.user.name}</h3>
        <span className="text-sm text-gray-500">{doctor.specialization}</span>
      </div>
      <p className="text-sm text-gray-500">{doctor.user.email}</p>
      <p className="mt-2 text-sm">
        <span className="font-medium">Hours:</span> {formatWorkingHours(doctor.workingHours)}
      </p>
      <p className="text-sm">
        <span className="font-medium">Slot length:</span> {doctor.slotDurationMinutes} min
      </p>

      <div className="mt-3">
        <p className="mb-1 text-sm font-medium">Leave days</p>
        {doctor.leaves.length === 0 && (
          <p className="text-sm text-gray-400">None scheduled</p>
        )}
        <ul className="space-y-1">
          {doctor.leaves.map((l) => (
            <li key={l.id} className="flex items-center gap-2 text-sm">
              <span>{new Date(l.date).toLocaleDateString()}</span>
              {l.reason && <span className="text-gray-500">— {l.reason}</span>}
              <button
                onClick={() => removeLeave(l.id)}
                className="text-xs text-red-600 underline"
              >
                remove
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={addLeave} className="mt-2 flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs text-gray-500">Date</label>
            <input
              type="date"
              required
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="rounded border px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Reason (optional)</label>
            <input
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="rounded border px-2 py-1 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            {loading ? "Marking…" : "Mark leave"}
          </button>
        </form>
        {notice && <p className="mt-2 text-sm text-amber-600">{notice}</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
