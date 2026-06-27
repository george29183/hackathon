"use client";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function Navbar({ role, onLogout }) {
  // Students use /student, Lecturers use /lecturer/dashboard
  const dashboardPath = role === "student" ? "/student" : "/lecturer/dashboard";
  
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={dashboardPath}>
          <p className="text-xl font-bold leading-none text-primary">Pace</p>
        </Link>
        <nav className="flex gap-2 items-center">
          <Link href={dashboardPath}>
            <Button variant="ghost">Dashboard</Button>
          </Link>
          {/* NEW: Profile Link */}
          <Link href={`/${role}/profile`}>
            <Button variant="ghost">Profile</Button>
          </Link>
          <Button variant="outline" onClick={onLogout}>Logout</Button>
        </nav>
      </div>
    </header>
  );
}