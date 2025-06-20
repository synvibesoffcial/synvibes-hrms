'use client';
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="flex gap-4 absolute top-8 right-8">
        <Link href="/sign-up">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Sign Up</button>
        </Link>
        <Link href="/sign-in">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Sign In</button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-purple-500 mb-6">
        Landing Page
      </h1>
    </div>
  );
}
