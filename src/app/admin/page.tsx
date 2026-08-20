import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { AddDoctorForm } from "@/components/admin/add-doctor-form";
import { DoctorCard, DoctorWithLeaves } from "@/components/admin/doctor-card";
import { WorkingHours } from "@/lib/working-hours";

export default async function AdminDashboard() {
  const session = await auth();

  const doctorsRaw = await prisma.doctorProfile.findMany({
    include: {
      user: { select: { name: true, email: true } },
      leaves: { orderBy: { date: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const doctors: DoctorWithLeaves[] = doctorsRaw.map((d) => ({
    id: d.id,
    specialization: d.specialization,
    slotDurationMinutes: d.slotDurationMinutes,
    workingHours: d.workingHours as WorkingHours,
    user: d.user,
    leaves: d.leaves.map((l) => ({
      id: l.id,
      date: l.date.toISOString(),
      reason: l.reason,
    })),
  }));

  return (
    <div className="mx-auto max-w-4xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <SignOutButton />
      </div>
      <p className="mb-6 text-gray-600">Signed in as {session?.user?.email}</p>

      <div className="mb-8">
        <AddDoctorForm />
      </div>

      <h2 className="mb-3 text-lg font-medium">Doctors ({doctors.length})</h2>
      <div className="space-y-4">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
        {doctors.length === 0 && (
          <p className="text-sm text-gray-500">No doctors yet — add one above.</p>
        )}
      </div>
    </div>
  );
}
