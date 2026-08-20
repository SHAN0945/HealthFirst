import { prisma } from "@/lib/prisma";
import { BookingFlow } from "@/components/patient/booking-flow";

export default async function BookAppointmentPage() {
  const doctors = await prisma.doctorProfile.findMany({
    select: {
      id: true,
      specialization: true,
      bio: true,
      slotDurationMinutes: true,
      user: { select: { name: true } },
    },
    orderBy: { specialization: "asc" },
  });

  return <BookingFlow initialDoctors={doctors} />;
}
