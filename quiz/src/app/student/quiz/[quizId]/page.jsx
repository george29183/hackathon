"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Stat } from "@/components/ui";

const labels = ["A", "B", "C", "D"];

export default function TakeQuiz() {
  const { quizId } = useParams();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const hasStarted = useRef(false);
  
  const [currentQ, setCurrentQ] = useState(0);
  // NEW: Array of objects instead of strings
  const [questionData, setQuestionData] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [presence, setPresence] = useState("active");
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuizAndStart = async () => {
      try {
        const res = await axios.get(`/api/quiz/${quizId}`);
        if (res.data.success) {
          setQuiz(res.data.quiz);
          // Initialize empty data objects for each question
          setQuestionData(new Array(res.data.quiz.questions.length).fill(null).map(() => ({
            selectedAnswer: null,
            isChanged: false,
            timeSpent: [],
            visits: 0
          })));
          if (quiz?.timeLimit > 0) setTimeLeft(quiz.timeLimit * 60);
          
          if (!hasStarted.current) {
            hasStarted.current = true;
            const startRes = await axios.post("/api/session/start", { quizId }, { withCredentials: true });
            if (startRes.data.success) setSessionId(startRes.data.sessionId);
          }
        }
      } catch (err) {
        console.error("Failed to load quiz", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizAndStart();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && quiz && !submitting && !result && questionData.length > 0) {
      handleSubmit(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    const handleVisibilityChange = () => setPresence(document.hidden ? "tab_switched" : "active");
    const handleOffline = () => setPresence("disconnected");
    const handleOnline = () => setPresence("active");
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // NEW: Unified navigation function for Next, Previous, or Submit
  const handleNavigation = async (action) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const newQData = [...questionData];
    
    // Record the time spent on this visit
    newQData[currentQ].timeSpent.push(timeSpent);
    newQData[currentQ].visits += 1;
    
    setQuestionData(newQData);

    // Update live session for lecturer
    if (sessionId) {
      try {
        await axios.post("/api/session/update", {
          sessionId,
          currentQuestion: action === "next" ? currentQ + 1 : currentQ,
          questionData: newQData,
          presence
        });
      } catch (err) { console.error(err); }
    }

    setQuestionStartTime(Date.now()); // Reset timer for next view

    if (action === "next") setCurrentQ((prev) => prev + 1);
    else if (action === "prev") setCurrentQ((prev) => prev - 1);
    else if (action === "submit") handleSubmit(false, newQData);
  };

  const handleSubmit = async (isAuto, finalData = questionData) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await axios.post("/api/session/submit", {
        quizId,
        questionData: finalData,
      }, { withCredentials: true });
      if (res.data.success) setResult(res.data.result);
    } catch (err) {
      alert("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectAnswer = (opt) => {
    const newQData = [...questionData];
    // If they already had an answer and it's different, mark as changed
    if (newQData[currentQ].selectedAnswer !== null && newQData[currentQ].selectedAnswer !== opt) {
      newQData[currentQ].isChanged = true;
    }
    newQData[currentQ].selectedAnswer = opt;
    setQuestionData(newQData);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center gradient-mesh">Loading Quiz...</div>;

  if (result) {
    const percent = Math.round((result.score / result.totalQuestions) * 100);
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-10 gradient-mesh">
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Quiz Complete</p>
            <h1 className="mt-3 text-4xl font-bold">{percent}%</h1>
            <p className="mt-2 text-muted-foreground">You scored {result.score} out of {result.totalQuestions}</p>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="outline" onClick={() => router.push("/student")}>Back to Dashboard</Button>
          </div>
        </Card>
      </main>
    );
  }

  if (!quiz) return <div className="min-h-screen flex items-center justify-center">Quiz not found.</div>;

  const question = quiz.questions[currentQ];
  const isLastQuestion = currentQ === quiz.questions.length - 1;
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;
  const currentAnswer = questionData[currentQ]?.selectedAnswer;

  return (
    <main className="flex min-h-screen flex-col gradient-mesh">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <strong className="text-lg text-primary">Pace</strong>
          <div className={`px-4 py-1.5 rounded-full font-mono font-bold text-sm ${timeLeft < 30 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted text-muted-foreground'}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="w-full max-w-xs">
            <p className="text-center text-xs text-muted-foreground">Question {currentQ + 1} of {quiz.questions.length}</p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">Q{currentQ + 1}</span>
          <h1 className="text-xl font-semibold leading-relaxed sm:text-2xl text-foreground">{question.questionText}</h1>
        </div>
        
        <div className="grid gap-3">
          {question.options.map((opt, index) => (
            <button
              key={index}
              onClick={() => selectAnswer(opt)}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                currentAnswer === opt ? "border-primary bg-primary text-primary-foreground scando-shadow-primary" : "border-border bg-card scando-shadow hover:bg-accent/50"
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${currentAnswer === opt ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                {labels[index]}
              </span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="sticky bottom-0 border-t border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          {currentQ > 0 ? (
            <Button variant="outline" onClick={() => handleNavigation("prev")}>Previous</Button>
          ) : <div className="w-24" />}

          <span className="text-xs text-muted-foreground">
            {questionData.filter(q => q.selectedAnswer !== null).length} answered
          </span>

          {isLastQuestion ? (
            <Button disabled={submitting} onClick={() => handleNavigation("submit")}>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button disabled={!currentAnswer} onClick={() => handleNavigation("next")}>Next Question</Button>
          )}
        </div>
      </footer>
    </main>
  );
}