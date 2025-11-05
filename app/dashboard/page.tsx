import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user has bar number
  const supabase = await createServerSupabase(userId);
  const { data: user } = await supabase
    .from('users')
    .select('bar_number')
    .eq('clerk_user_id', userId)
    .single();

  if (!user?.bar_number) {
    redirect('/onboarding');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              SoloLawyerOS
            </h1>
            <UserButton />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Dashboard
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Secure legal document generation workspace
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/motions"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
              Create Motion
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generate legal motions with court-specific templates
            </p>
          </Link>

          <Link
            href="/dashboard/documents"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
              Documents
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              View and manage your legal documents
            </p>
          </Link>

          <Link
            href="/dashboard/files"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
              Files
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Secure file storage with auto-expiry
            </p>
          </Link>

          <Link
            href="/dashboard/audit"
            className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
          >
            <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
              Audit Logs
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              View your activity and security logs
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

