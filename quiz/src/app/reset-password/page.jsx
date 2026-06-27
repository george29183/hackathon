"use client";
import { useState, Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Card, Field, Input } from "@/components/ui";
import Link from "next/link";

function ResetPasswordComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/reset-password", { token, newPassword: password });
      if (res.data.success) {
        setSuccess("Password updated! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center p-4 gradient-mesh">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">🔒</div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your new password below.</p>
        </div>

        {error && <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {success && <p className="mb-4 rounded-xl bg-success/10 p-3 text-sm text-success">{success}</p>}

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <Field label="New Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
          </Field>
          <Field label="Confirm New Password">
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" required />
          </Field>
          <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Password"}</Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it? <Link href="/login" className="text-primary font-semibold">Login</Link>
        </p>
      </Card>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center gradient-mesh">Loading...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  );
}