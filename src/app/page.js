import Link from "next/link";
import { Button, Card } from "@/components/ui";
import HeroSmoke from "@/components/HeroSmoke";
import Logo  from "@/components/logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthDemo } from "@/components/demos/AuthDemo";
import { QuizGenDemo } from "@/components/demos/QuizGenDemo";
import { AnalyticsDemo } from "@/components/demos/AnalyticsDemo";
import { QuizTakingDemo } from "@/components/demos/QuizTakingDemo";

const flow = ["Verify", "Generate", "Share", "Measure"];

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-background">
      {/* Unified Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 max-h-12 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-primary">
            <Logo />
          </Link>
          
          {/* NEW: Updated Navigation Links */}
          <div className="hidden items-center gap-7 text-sm font-semibold text-muted-foreground lg:flex">
            <a href="#ai-quiz" className="transition hover:text-primary">AI Generation</a>
            <a href="#analytics" className="transition hover:text-primary">Live Analytics</a>
            <a href="#student-app" className="transition hover:text-primary">Student App</a>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ThemeToggle />
            <Link href="/lecturer/login">
              <Button variant="ghost" className="px-3 sm:px-4">
                <span className="sm:hidden">Login</span>
                <span className="hidden sm:inline">Teacher login</span>
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="px-4">
                Sign up
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <HeroSmoke>
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl items-center justify-center px-5 py-16 text-center sm:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="mx-auto mb-5 max-w-max rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              Built for teachers and fast classroom quiz moments
            </p>
            <h1 className="text-7xl font-black leading-none tracking-tight text-foreground sm:text-8xl lg:text-9xl">
              PACE
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
              An AI-powered quiz platform that helps teachers turn PDFs into quizzes, track academic integrity, and visualize student struggles in real-time.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/lecturer/signup">
                <Button variant="outline" className="px-7 py-3.5 text-base">
                  <span className="grid text-left text-accent-foreground leading-tight">
                    <span className="text-xs font-black uppercase">Teachers</span>
                    <span>Sign up for free</span>
                  </span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="px-7 py-3.5 text-base">
                  <span className="grid text-left leading-tight">
                    <span className="text-xs font-black uppercase">Students</span>
                    <span>Sign up for free</span>
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </HeroSmoke>

      {/* Feature Section 1: Auth Flow */}
      <section id="onboarding" className="bg-background px-5 py-20 sm:px-8 border-b border-border">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary mb-3">Secure Onboarding</p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              From Sign up to <span className="text-primary">Verified.</span>
            </h2>
            <div className="mt-6 text-lg leading-8 text-muted-foreground space-y-4">
              <p>
                We don't just use passwords. Pace integrates Nodemailer to send a secure verification link directly to the student's Gmail.
              </p>
              <p>
                DynamoDB securely hashes passwords with <span className="font-medium text-foreground">Bcryptjs</span> and tracks verification status, ensuring only authorized students can access your quizzes.
              </p>
            </div>
          </div>
          <AuthDemo />
        </div>
      </section>

      {/* Feature Section 2: AI Quiz Gen */}
      <section id="ai-quiz" className="bg-muted/30 px-5 py-20 sm:px-8 border-b border-border">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <QuizGenDemo />
          </div>
          <div className="order-1 md:order-2 text-center md:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary mb-3">AI Powered</p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Turn PDFs into <span className="text-primary">Quizzes.</span>
            </h2>
            <div className="mt-6 text-lg leading-8 text-muted-foreground space-y-4">
              <p>
                Lecturers don't have time to write 20 questions. With Pace, they upload a lecture PDF, and our Groq AI integration instantly generates a customized, difficulty-graded quiz.
              </p>
              <p>
                The AI structures the JSON, writes the questions, and provides the exact text of the correct answer—ready to be saved directly to AWS DynamoDB.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3: Live Analytics */}
      <section id="analytics" className="bg-background px-5 py-20 sm:px-8 border-b border-border">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary mb-3">Real-Time Proctoring</p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              See the <span className="text-primary">Struggle.</span> Catch the <span className="text-destructive">Cheats.</span>
            </h2>
            <div className="mt-6 text-lg leading-8 text-muted-foreground space-y-4">
              <p>
                Don't just grade the answer—grade the process. Pace tracks tab switches, window blurs, and copy/paste attempts in real-time.
              </p>
              <p>
                Our engine calculates a weighted <span className="font-medium text-foreground">Integrity Risk Score</span>, visualizes hesitation in a live heatmap, and lets you export everything to CSV with one click.
              </p>
            </div>
          </div>
          <AnalyticsDemo />
        </div>
      </section>

      {/* Feature Section 4: Student Quiz Environment */}
      <section id="student-app" className="bg-muted/30 px-5 py-20 sm:px-8 border-b border-border">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <QuizTakingDemo />
          </div>
          <div className="order-1 md:order-2 text-center md:text-left">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary mb-3">Focused & Proctored</p>
            <h2 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              A lockdown <span className="text-primary">Experience.</span>
            </h2>
            <div className="mt-6 text-lg leading-8 text-muted-foreground space-y-4">
              <p>
                Students enter a fullscreen, distraction-free environment. A live timer creates urgency, auto-submitting the quiz when time expires.
              </p>
              <p>
                If they attempt to leave the tab, open Discord, or paste an answer, Pace logs the event instantly and flags it on the lecturer's heatmap. Every second spent hesitating is tracked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Works Section (Simplified Flow) */}
      <section className="gradient-mesh px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">Built around the teaching moment.</h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              The product keeps the classroom loop visible from setup to review.
            </p>
          </div>

          <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-border md:block" aria-hidden="true" />
            {flow.map((step, index) => (
              <li key={step} className="relative z-10 flex flex-col items-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full border border-border bg-card font-mono text-lg font-semibold text-primary scando-shadow-lg">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-base font-semibold tracking-tight">{step}</h3>
              </li>
            ))}
          </ol>
        </div>
      </section>
      
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Built for the Vercel v0 x AWS Databases Hackathon
      </footer>
    </main>
  );
}