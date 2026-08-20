import { redirect } from "next/navigation";
import { auth } from "@/auth";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  DOCTOR: "/doctor",
  PATIENT: "/patient",
};

export default async function Home() {
  const session = await auth();

  if (session?.user?.role) {
    redirect(ROLE_HOME[session.user.role] ?? "/login");
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">Clinic Appointment &amp; Follow-up Manager</h1>
      <p className="text-gray-600">
        Book appointments, share symptoms ahead of your visit, and get a plain-language
        summary and medication reminders afterwards.
      </p>
      <div className="flex gap-4">
        <a href="/login" className="rounded bg-blue-600 px-4 py-2 text-white">
          Sign in
        </a>
        <a href="/register" className="rounded border px-4 py-2">
          Create a patient account
        </a>
      </div>
    </div>
  );
}
