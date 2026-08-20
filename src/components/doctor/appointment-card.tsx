"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SymptomForm = {
  symptoms: string;
  aiUrgency: string | null;
  aiChiefComplaint: string | null;
  aiSuggestedQuestions: string[] | null;
  aiSummaryFailed: boolean;
};

type VisitNotes = {
  doctorNotes: string;
  prescription: string;
  aiPatientSummary: string | null;
  aiSummaryFailed: boolean;
};

export type DoctorAppointment = {
  id: string;
  slotStart: string;
  status: string;
  patient: { user: { name: string } };
  symptomForm: SymptomForm | null;
  visitNotes: VisitNotes | null;
};

const URGENCY_STYLES: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-red-100 text-red-800",
};

export function DoctorAppointmentCard({ appointment }: { appointment: DoctorAppointment }) {
  const router = useRouter();
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitNotes(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/doctor/appointments/${appointment.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorNotes, prescription }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save notes");
      return;
    }
    setShowNotesForm(false);
    router.refresh();
  }

  return (
    <div className="rounded border p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{appointment.patient.user.name}</p>
          <p className="text-sm text-gray-600">{new Date(appointment.slotStart).toLocaleString()}</p>
        </div>
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
          {appointment.status}
        </span>
      </div>

      {appointment.symptomForm && (
        <div className="mt-3 rounded bg-gray-50 p-3 text-sm">
          <p className="mb-1 font-medium">Pre-visit summary</p>
          <p className="mb-2 text-gray-600">Reported symptoms: {appointment.symptomForm.symptoms}</p>
          {appointment.symptomForm.aiSummaryFailed ? (
            <p className="text-amber-600">AI summary unavailable — review symptoms above directly.</p>
          ) : (
            <>
              <span
                className={`mb-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  URGENCY_STYLES[appointment.symptomForm.aiUrgency ?? ""] ?? ""
                }`}
              >
                Urgency: {appointment.symptomForm.aiUrgency}
              </span>
              <p className="mb-1">
                <strong>Chief complaint:</strong> {appointment.symptomForm.aiChiefComplaint}
              </p>
              {appointment.symptomForm.aiSuggestedQuestions && (
                <ul className="list-disc pl-5 text-gray-600">
                  {appointment.symptomForm.aiSuggestedQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      {appointment.visitNotes ? (
        <div className="mt-3 rounded bg-green-50 p-3 text-sm">
          <p className="mb-1 font-medium">Visit notes submitted</p>
          <p className="text-gray-600">{appointment.visitNotes.doctorNotes}</p>
          <p className="mt-1 text-gray-600">Prescription: {appointment.visitNotes.prescription}</p>
          {appointment.visitNotes.aiSummaryFailed ? (
            <p className="mt-2 text-amber-600">AI patient-summary generation failed for this visit.</p>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-gray-700">
              <strong>Patient-friendly summary:</strong> {appointment.visitNotes.aiPatientSummary}
            </p>
          )}
        </div>
      ) : appointment.status === "CONFIRMED" ? (
        showNotesForm ? (
          <form onSubmit={submitNotes} className="mt-3 space-y-2">
            <textarea
              required
              rows={3}
              placeholder="Clinical notes"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            <textarea
              required
              rows={2}
              placeholder="Prescription (medication, dosage, frequency, duration)"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Save & complete visit"}
              </button>
              <button
                type="button"
                onClick={() => setShowNotesForm(false)}
                className="rounded border px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowNotesForm(true)}
            className="mt-3 rounded border px-3 py-1.5 text-sm"
          >
            Add post-visit notes
          </button>
        )
      ) : null}
    </div>
  );
}
