import Link from "next/link";
import { Button, Card } from "@/components/ui";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gradient-mesh">
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="text-xl font-bold text-primary">Pace</span>
        <div className="flex gap-2">
          <Link href="/lecturer/login"><Button variant="ghost">Login</Button></Link>
          <Link href="/lecturer/signup"><Button variant="outline">Sign up</Button></Link>
        </div>
      </div>

      <section className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold tracking-tight sm:text-7xl">Pace</h1>
          <p className="mt-3 text-lg tracking-wide text-muted-foreground">Every second tells a story</p>
          <p className="mt-1 text-sm tracking-wide text-muted-foreground/75">
            Track time spent on each question, not just the final score
          </p>
        </div>

        <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
          <Link href="/lecturer/login" className="w-full">
            <Card className="group p-8 text-center transition hover:-translate-y-1 hover:scando-shadow-primary cursor-pointer h-full">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary transition group-hover:bg-primary/15">
                T
              </span>
              <h2 className="mt-4 text-xl font-semibold">I'm a Teacher</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Log in to create quizzes and track student performance.</p>
            </Card>
          </Link>

          <Link href="/login" className="w-full">
            <Card className="group p-8 text-center transition hover:-translate-y-1 hover:scando-shadow-primary cursor-pointer h-full">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary transition group-hover:bg-primary/15">
                S
              </span>
              <h2 className="mt-4 text-xl font-semibold">I'm a Student</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Log in to join a quiz and test your knowledge.</p>
            </Card>
          </Link>
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        Built for the Vercel v0 x AWS Databases Hackathon
      </footer>
    </main>
  );
}