import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-4xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            SoloLawyerOS
          </h1>
          <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            FORTRESS EDITION
          </div>
        </div>

        <SignedOut>
          <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Secure Legal Document Generation
            </h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              Zero Trust Architecture. Enterprise Security. Legal Accuracy.
            </p>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="mb-6 flex items-center justify-end">
            <UserButton />
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
            <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Welcome Back
            </h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              Access your secure legal document workspace.
            </p>
            <Link
              href="/dashboard"
              className="inline-block rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Go to Dashboard
            </Link>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
