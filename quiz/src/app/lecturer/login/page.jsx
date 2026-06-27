"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Field, Input } from "@/components/ui";

export default function LecturerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/lecturer/login", { email, password });
      if (response.data.success) {
        router.push("/lecturer/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center p-4 gradient-mesh">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">T</div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold">Lecturer Login</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your lecturer credentials to continue.</p>
        </div>

        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <form className="mt-6 grid gap-4" onSubmit={handleLogin}>
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></Field>
          <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required /></Field>
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? "Signing in..." : "Login as Lecturer"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href="/lecturer/signup" className="font-semibold text-primary hover:underline">Sign up</Link>
        </p>
      </Card>
    </main>
  );
}