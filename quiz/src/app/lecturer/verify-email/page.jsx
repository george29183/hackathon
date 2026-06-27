"use client";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";

function VerifyComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    if (token) {
      axios.post("/api/auth/verify-email", { token })
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
  }, [token]);

  return (
    <main className="grid min-h-screen place-items-center p-4 gradient-mesh">
      <Card className="w-full max-w-lg p-8 text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary animate-pulse">@</div>
            <h1 className="mt-2 text-3xl font-bold">Verifying...</h1>
            <p className="mt-3 text-sm text-muted-foreground">Please wait while we verify your email.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-xl font-bold text-success">✓</div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-success">Success</p>
            <h1 className="mt-2 text-3xl font-bold">Email Verified!</h1>
            <p className="mt-3 text-sm text-muted-foreground">You can now log in to your lecturer account.</p>
            <Button className="mt-6 w-full" onClick={() => router.push("/lecturer/login")}>Go to Lecturer Login</Button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-xl font-bold text-destructive">✕</div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-destructive">Failed</p>
            <h1 className="mt-2 text-3xl font-bold">Verification Failed</h1>
            <p className="mt-3 text-sm text-muted-foreground">The link is invalid or has expired.</p>
            <Button className="mt-6 w-full" variant="outline" onClick={() => router.push("/lecturer/signup")}>Back to Sign Up</Button>
          </>
        )}
      </Card>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center gradient-mesh">Loading...</div>}>
      <VerifyComponent />
    </Suspense>
  );
}