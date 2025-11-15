import Link from "next/link";
export const dynamic = "force-static";
export default function Custom500() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 px-6">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold text-trust-blue">Something went wrong</h1>
        <p className="text-wisdom-gray">
          We hit an unexpected error while rendering this page. Please refresh or return to the
          homepage while we look into it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-trust-blue text-white font-semibold hover:bg-trust-blue-600 transition"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
