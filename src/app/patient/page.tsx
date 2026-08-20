import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { AppointmentList } from "@/components/patient/appointment-list";
import { getPatientProfileId } from "@/lib/current-user";

export default async function PatientDashboard() {
  const session = await auth();
  const patientId = session?.user?.id ? await getPatientProfileId(session.user.id) : null;

  const appointments = patientId
    ? await prisma.appointment.findMany({
        where: { patientId },
        include: {
          doctor: { select: { specialization: true, user: { select: { name: true } } } },
          symptomForm: { select: { aiUrgency: true, aiSummaryFailed: true } },
          visitNotes: { select: { aiPatientSummary: true, aiSummaryFailed: true } },
        },
        orderBy: { slotStart: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My appointments</h1>
        <div className="flex items-center gap-3">
          <a href="/patient/book" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
            + Book appointment
          </a>
          <SignOutButton />
        </div>
      </div>
      <p className="mb-6 text-gray-600">Signed in as {session?.user?.email}</p>

      <AppointmentList
        appointments={appointments.map((a) => ({
          ...a,
          slotStart: a.slotStart.toISOString(),
        }))}
      />
    </div>
  );
}
