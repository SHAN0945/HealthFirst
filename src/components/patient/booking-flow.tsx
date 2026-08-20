"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Doctor = {
  id: string;
  specialization: string;
  bio: string | null;
  slotDurationMinutes: number;
  user: { name: string };
};

type Slot = { start: string; end: string };

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export function BookingFlow({ initialDoctors }: { initialDoctors: Doctor[] }) {
  const router = useRouter();

  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState(todayISODate());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [holdAppointmentId, setHoldAppointmentId] = useState<string | null>(null);
  const [holdSlot, setHoldSlot] = useState<Slot | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [step, setStep] = useState<"search" | "slots" | "symptoms" | "done">("search");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function searchDoctors(e?: React.FormEvent) {
    e?.preventDefault();
    setLoadingDoctors(true);
    const qs = specialization ? `?specialization=${encodeURIComponent(specialization)}` : "";
    const res = await fetch(`/api/doctors${qs}`);
    const data = await res.json();
    setDoctors(data.doctors ?? []);
    setLoadingDoctors(false);
  }

  async function loadSlots(doctor: Doctor, d: string) {
    setSelectedDoctor(doctor);
    setDate(d);
    setStep("slots");
    setLoadingSlots(true);
    setError(null);
    const res = await fetch(`/api/doctors/${doctor.id}/slots?date=${d}`);
    const data = await res.json();
    setSlots(data.slots ?? []);
    setLoadingSlots(false);
  }

  async function holdSlotAndProceed(slot: Slot) {
    if (!selectedDoctor) return;
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/patient/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: selectedDoctor.id, slotStart: slot.start }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "That slot just became unavailable — pick another.");
      loadSlots(selectedDoctor, date);
      return;
    }
    const data = await res.json();
    setHoldAppointmentId(data.appointment.id);
    setHoldSlot(slot);
    setStep("symptoms");
  }

  async function confirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!holdAppointmentId) return;
    setError(null);
    setSubmitting(true);
    const res = await fetch(`/api/patient/appointments/${holdAppointmentId}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to confirm booking");
      return;
    }
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="mb-2 text-2xl font-semibold">Appointment confirmed</h1>
        <p className="text-gray-600">
          Booked with {selectedDoctor?.user.name} on{" "}
          {holdSlot && new Date(holdSlot.start).toLocaleString()}.
        </p>
        <button
          onClick={() => router.push("/patient")}
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Go to my appointments
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="mb-6 text-2xl font-semibold">Book an appointment</h1>

      {step === "search" || step === "slots" ? (
        <>
          <form onSubmit={searchDoctors} className="mb-6 flex gap-2">
            <input
              placeholder="Search by specialization (e.g. Cardiology)"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="flex-1 rounded border px-3 py-2"
            />
            <button type="submit" className="rounded border px-4 py-2">
              Search
            </button>
          </form>

          {loadingDoctors ? (
            <p className="text-gray-500">Loading doctors…</p>
          ) : (
            <div className="space-y-3">
              {doctors.map((doc) => (
                <div key={doc.id} className="rounded border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{doc.user.name}</p>
                      <p className="text-sm text-gray-500">{doc.specialization}</p>
                      {doc.bio && <p className="mt-1 text-sm text-gray-600">{doc.bio}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        min={todayISODate()}
                        value={selectedDoctor?.id === doc.id ? date : todayISODate()}
                        onChange={(e) => loadSlots(doc, e.target.value)}
                        className="rounded border px-2 py-1 text-sm"
                      />
                    </div>
                  </div>

                  {selectedDoctor?.id === doc.id && step === "slots" && (
                    <div className="mt-3 border-t pt-3">
                      {loadingSlots ? (
                        <p className="text-sm text-gray-500">Loading slots…</p>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-gray-500">No available slots this day.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {slots.map((s) => (
                            <button
                              key={s.start}
                              disabled={submitting}
                              onClick={() => holdSlotAndProceed(s)}
                              className="rounded border px-3 py-1.5 text-sm hover:bg-blue-50 disabled:opacity-50"
                            >
                              {new Date(s.start).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {doctors.length === 0 && (
                <p className="text-sm text-gray-500">No doctors found.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={confirmBooking} className="space-y-4">
          <div className="rounded border bg-blue-50 p-3 text-sm">
            Holding <strong>{selectedDoctor?.user.name}</strong> at{" "}
            <strong>{holdSlot && new Date(holdSlot.start).toLocaleString()}</strong> for the next
            5 minutes — finish this form to confirm.
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Describe your symptoms</label>
            <textarea
              required
              rows={5}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="What's been going on? When did it start? Anything that makes it better or worse?"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {submitting ? "Confirming…" : "Confirm appointment"}
            </button>
            <button type="button" onClick={() => setStep("slots")} className="rounded border px-4 py-2">
              Back
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
