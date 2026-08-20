import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AdminDashboard() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-4xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <SignOutButton />
      </div>
      <p className="text-gray-600">Signed in as {session?.user?.email}</p>
      <p className="mt-8 text-sm text-gray-500">
        Doctor management (create profiles, set working hours, mark leave) lands in
        Phase 3.
      </p>
    </div>
  );
}
