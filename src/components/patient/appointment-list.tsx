"use client";

import { useRouter } from "next/navigation";

type Appointment = {
  id: string;
  slotStart: string;
  status: string;
  doctor: { specialization: string; user: { name: string } };
  symptomForm: { aiUrgency: string | null; aiSummaryFailed: boolean } | null;
  visitNotes: { aiPatientSummary: string | null; aiSummaryFailed: boolean } | null;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-gray-100 text-gray-500",
  COMPLETED: "bg-green-100 text-green-800",
};

export function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  const router = useRouter();

  async function cancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    await fetch(`/api/patient/appointments/${id}/cancel`, { method: "POST" });
    router.refresh();
  }

  if (appointments.length === 0) {
    return <p className="text-sm text-gray-500">No appointments yet.</p>;
  }

  return (
    <div className="space-y-3">
      {appointments.map((a) => (
        <div key={a.id} className="rounded border p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">
                {a.doctor.user.name}{" "}
                <span className="font-normal text-gray-500">— {a.doctor.specialization}</span>
              </p>
              <p className="text-sm text-gray-600">{new Date(a.slotStart).toLocaleString()}</p>
            </div>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
              {a.status}
            </span>
          </div>

          {a.symptomForm && (
            <p className="mt-2 text-sm text-gray-600">
              Pre-visit AI summary:{" "}
              {a.symptomForm.aiSummaryFailed
                ? "unavailable (AI summary failed — your symptoms were still recorded)"
                : `urgency ${a.symptomForm.aiUrgency ?? "—"}`}
            </p>
          )}

          {a.visitNotes && (
            <div className="mt-2 rounded bg-gray-50 p-3 text-sm">
              <p className="mb-1 font-medium">Visit summary</p>
              {a.visitNotes.aiSummaryFailed || !a.visitNotes.aiPatientSummary ? (
                <p className="text-gray-500">AI summary unavailable — ask your doctor for details.</p>
              ) : (
                <p className="whitespace-pre-wrap text-gray-700">{a.visitNotes.aiPatientSummary}</p>
              )}
            </div>
          )}

          {(a.status === "PENDING" || a.status === "CONFIRMED") && (
            <button
              onClick={() => cancel(a.id)}
              className="mt-3 text-sm text-red-600 underline"
            >
              Cancel appointment
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
