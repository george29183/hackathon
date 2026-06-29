"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Stat } from "@/components/ui";
import Navbar from "@/components/navbar";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("/api/student/history", { withCredentials: true });
        if (res.data.success) setHistory(res.data.history);
      } catch (err) { console.error(err); }
    };
    fetchHistory();
  }, []);

  const handleLogout = async () => {
    await axios.get("/api/auth/logout");
    router.push("/login");
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("/api/student/join-quiz", { code });
      if (response.data.success) router.push(`/student/quiz/${response.data.quiz.quizId}`);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to find quiz. Try again.";
      setError(errorMsg);
      if (errorMsg.includes("deactivated")) {
        toast.error("This quiz is closed.");
      }
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen gradient-mesh">
      <Navbar role="student" onLogout={handleLogout} />
      
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 grid lg:grid-cols-2 gap-8">
        {/* Join Quiz Card */}
        <Card className="p-8 h-fit">
          <div className="text-center mb-6">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">S</div>
            <h1 className="text-2xl font-bold">Join a Quiz</h1>
            <p className="mt-2 text-sm text-muted-foreground">Enter the access key provided by your teacher.</p>
          </div>
          <form className="grid gap-5" onSubmit={handleJoin}>
            <Field label="Access Key">
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" className="text-center tracking-[0.3em] font-mono" required />
            </Field>
            {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? "Searching..." : "Join Quiz"}</Button>
          </form>
        </Card>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          {history.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No quizzes taken yet.</Card>
          ) : (
            <div className="grid gap-4">
              {history.map((quiz) => {
                const percent = Math.round((quiz.score / quiz.totalQuestions) * 100);
                return (
                  <Card key={quiz.sessionId} className="p-5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-muted-foreground text-sm">Completed</p>
                      <p className="text-lg font-bold">{quiz.quizTitle || quiz.quizId}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${percent > 50 ? 'text-success' : 'text-destructive'}`}>{percent}%</p>
                      <p className="text-xs text-muted-foreground">{quiz.score}/{quiz.totalQuestions} correct</p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}