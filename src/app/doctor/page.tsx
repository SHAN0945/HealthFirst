import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { DoctorAppointmentCard } from "@/components/doctor/appointment-card";
import { getDoctorProfileId } from "@/lib/current-user";

export default async function DoctorDashboard() {
  const session = await auth();
  const doctorId = session?.user?.id ? await getDoctorProfileId(session.user.id) : null;

  const appointments = doctorId
    ? await prisma.appointment.findMany({
        where: { doctorId, status: { in: ["CONFIRMED", "COMPLETED"] } },
        include: {
          patient: { select: { user: { select: { name: true } } } },
          symptomForm: true,
          visitNotes: true,
        },
        orderBy: { slotStart: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My appointments</h1>
        <SignOutButton />
      </div>
      <p className="mb-6 text-gray-600">Signed in as {session?.user?.email}</p>

      <div className="space-y-4">
        {appointments.map((a) => (
          <DoctorAppointmentCard
            key={a.id}
            appointment={{
              id: a.id,
              slotStart: a.slotStart.toISOString(),
              status: a.status,
              patient: a.patient,
              symptomForm: a.symptomForm
                ? {
                    symptoms: a.symptomForm.symptoms,
                    aiUrgency: a.symptomForm.aiUrgency,
                    aiChiefComplaint: a.symptomForm.aiChiefComplaint,
                    aiSuggestedQuestions: a.symptomForm.aiSuggestedQuestions as string[] | null,
                    aiSummaryFailed: a.symptomForm.aiSummaryFailed,
                  }
                : null,
              visitNotes: a.visitNotes
                ? {
                    doctorNotes: a.visitNotes.doctorNotes,
                    prescription: a.visitNotes.prescription,
                    aiPatientSummary: a.visitNotes.aiPatientSummary,
                    aiSummaryFailed: a.visitNotes.aiSummaryFailed,
                  }
                : null,
            }}
          />
        ))}
        {appointments.length === 0 && (
          <p className="text-sm text-gray-500">No upcoming or completed appointments.</p>
        )}
      </div>
    </div>
  );
}
