"use client";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle"; // ADD THIS
import Image from "next/image";
import logo from "@/components/pace-logo-dark.svg";
import darkLogo from "@/components/pace-logo-white.svg";
import { useTheme } from "next-themes";

export default function Navbar({ role, onLogout }) {
  const dashboardPath = role === "student" ? "/student" : "/lecturer/dashboard";
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={dashboardPath}>
       <Image src={isDarkMode ? darkLogo : logo} alt="Pace Logo" height={200} width={200} />
        </Link>
        <nav className="flex gap-2 items-center">
          <Link href={dashboardPath}>
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href={`/${role}/profile`}>
            <Button variant="ghost">Profile</Button>
          </Link>
          <ThemeToggle /> {/* ADD THIS */}
          <Button variant="outline" onClick={onLogout}>Logout</Button>
        </nav>
      </div>
    </header>
  );
}