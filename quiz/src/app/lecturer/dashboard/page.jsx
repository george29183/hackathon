"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Header } from "@/components/ui";
import Navbar from "@/components/navbar";


export default function LecturerDashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get("/api/quiz", { withCredentials: true });
        if (response.data.success) {
          const sorted = response.data.quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setQuizzes(sorted);
        }
      } catch (err) {
        console.error("Failed to load quizzes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleLogout = async () => {
    await axios.get("/api/auth/logout");
    router.push("/lecturer/login");
  };

  return (
    <main className="min-h-screen gradient-mesh">
      <Navbar role="lecturer" onLogout={handleLogout} />
      
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Quizzes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create, share, and review learning patterns.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/lecturer/create-quiz">
              <Button variant="outline">+ AI Quiz</Button>
            </Link>
            <Link href="/lecturer/create-manual">
              <Button>+ Manual Quiz</Button>
            </Link>
          </div>
        </div>

        {loading && <p className="text-center text-muted-foreground py-10">Loading quizzes...</p>}

        {!loading && quizzes.length === 0 && (
          <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">Q</div>
            <h3 className="text-xl font-bold">No quizzes yet</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Create your first quiz and Pace will start collecting score and timing insights once students submit answers.
            </p>
            <Link href="/lecturer/create-quiz" className="mt-6">
              <Button>Create Your First AI Quiz</Button>
            </Link>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.quizId} className="p-5 flex flex-col border-l-4 border-l-success">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{quiz.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground capitalize">{quiz.category} - {quiz.difficulty}</p>
                </div>
                <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-success text-white">
                  Active
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-5">
                <span className="rounded-full border border-border px-2.5 py-1 font-mono text-foreground">
                  {quiz.quizCode}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1">
                  {quiz.questions?.length || 0} questions
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-2">
                <Link href={`/lecturer/monitor/${quiz.quizId}`}>
                  <Button variant="outline">View Analytics</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}