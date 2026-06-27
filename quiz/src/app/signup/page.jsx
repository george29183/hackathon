"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Field, Input } from "@/components/ui";

export default function StudentSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
  
     if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
     }

    try {
      const response = await axios.post("/api/auth/signup", formData);
      if (response.data.success) {
        setSuccess("Account created! Check your email for a verification link.");
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center p-4 gradient-mesh">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">S</div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Create account</p>
          <h1 className="mt-2 text-3xl font-bold">Sign up for Pace</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create a student account to join quizzes.</p>
        </div>

        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {success && <p className="mt-4 rounded-xl bg-success/10 p-3 text-sm text-success">{success}</p>}

        <form className="mt-6 grid gap-4" onSubmit={handleSignup}>
          <Field label="Username"><Input name="username" required value={formData.username} onChange={handleChange} placeholder="Your name" /></Field>
          <Field label="Email"><Input name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" /></Field>
          <Field label="Password"><Input name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="At least 6 characters" /></Field>
          <Field label="Confirm Password">
          <Input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />
        </Field>

          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? "Creating account..." : "Create Student Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">Login</Link>
        </p>
      </Card>
    </main>
  );
}