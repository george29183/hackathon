"use client";
import { useState } from "react";
import axios from "axios";
import { Button, Card, Field, Input } from "@/components/ui";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (error) {
      setMessage("Failed to send reset email.");
    } finally { setLoading(false); }
  };

  return (
    <main className="grid min-h-screen place-items-center p-4 gradient-mesh">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
        </div>
        {message && <p className="mb-4 rounded-xl bg-muted p-3 text-sm text-center">{message}</p>}
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></Field>
          <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered? <Link href="/login" className="text-primary font-semibold">Login</Link>
        </p>
      </Card>
    </main>
  );
}