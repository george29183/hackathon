"use client";
import { Button } from "@/components/ui";

export default function Error({ reset }) {
  return (
    <main className="min-h-screen grid place-items-center p-4 gradient-mesh">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card scando-shadow-lg text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-xl font-bold text-destructive">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button className="mt-6 w-full" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </main>
  );
}