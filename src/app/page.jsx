"use client";

import { useMemo, useRef, useState } from "react";

const labels = ["A", "B", "C", "D"];

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function generateAccessKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatTime(seconds) {
  const value = Math.max(1, Math.round(seconds));
  const mins = Math.floor(value / 60);
  const secs = value % 60;
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
}

function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:shadow-[0_8px_24px_oklch(0.7_0.19_40_/_0.22)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-card hover:bg-accent",
    ghost: "hover:bg-muted text-muted-foreground hover:text-foreground",
    danger: "text-destructive hover:bg-destructive/10",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`min-h-24 rounded-xl border border-input bg-card px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 ${className}`}
      {...props}
    />
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-border bg-card scando-shadow-lg ${className}`}>{children}</div>;
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-muted/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState("landing");
  const [authMode, setAuthMode] = useState("login");
  const [authRole, setAuthRole] = useState("teacher");
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [questionTimes, setQuestionTimes] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const startedAtRef = useRef(null);
  const questionStartRef = useRef(null);

  function goHome() {
    setView("landing");
    setCurrentQuiz(null);
    setQuestionIndex(0);
    setStudentAnswers([]);
    setQuestionTimes([]);
    setCurrentAttempt(null);
  }

  function openAuth(mode, role = "teacher") {
    setAuthMode(mode);
    setAuthRole(role);
    setView(mode);
  }

  function completeAuth({ name, email, role }) {
    const displayName = name.trim() || email.split("@")[0] || "Pace User";
    setUser({ name: displayName, email, role });
    setStudentName(role === "student" ? displayName : "");
    setView(role === "teacher" ? "teacher" : "student");
  }

  function logout() {
    setUser(null);
    setStudentName("");
    goHome();
  }

  function joinQuiz(accessKey, name) {
    const quiz = quizzes.find(
      (item) => item.accessKey === accessKey.trim().toUpperCase() && item.isActive
    );
    if (!quiz) return false;

    setStudentName(name.trim() || "Anonymous");
    setCurrentQuiz(quiz);
    setQuestionIndex(0);
    setStudentAnswers(new Array(quiz.questions.length).fill(null));
    setQuestionTimes(new Array(quiz.questions.length).fill(0));
    startedAtRef.current = Date.now();
    questionStartRef.current = Date.now();
    setView("quiz");
    return true;
  }

  function recordTime(index = questionIndex) {
    if (!questionStartRef.current) questionStartRef.current = Date.now();
    const elapsed = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));
    setQuestionTimes((prev) => prev.map((time, i) => (i === index ? time + elapsed : time)));
    questionStartRef.current = Date.now();
  }

  function moveToQuestion(nextIndex) {
    if (!currentQuiz || nextIndex < 0 || nextIndex >= currentQuiz.questions.length) return;
    recordTime();
    setQuestionIndex(nextIndex);
  }

  function submitQuiz() {
    if (!currentQuiz) return;
    recordTime();

    const completedAt = Date.now();
    const answers = currentQuiz.questions.map((question, index) => {
      const selectedAnswer = studentAnswers[index];
      return {
        questionId: question.id,
        questionIndex: index,
        questionText: question.text,
        options: question.options,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: selectedAnswer === question.correctAnswer,
        timeSpent: Math.max(1, questionTimes[index] || 1),
      };
    });

    const attempt = {
      id: uid("attempt"),
      quizId: currentQuiz.id,
      studentName,
      answers,
      totalScore: answers.filter((answer) => answer.isCorrect).length,
      totalQuestions: answers.length,
      totalTime: Math.max(1, Math.round((completedAt - (startedAtRef.current || completedAt)) / 1000)),
      startedAt: new Date(startedAtRef.current || completedAt).toISOString(),
      completedAt: new Date(completedAt).toISOString(),
    };

    setAttempts((prev) => [...prev, attempt]);
    setCurrentAttempt(attempt);
    setView("results");
  }

  const sharedProps = {
    view,
    setView,
    quizzes,
    setQuizzes,
    attempts,
    setAttempts,
    currentQuiz,
    setCurrentQuiz,
    questionIndex,
    setQuestionIndex,
    studentAnswers,
    setStudentAnswers,
    currentAttempt,
    setCurrentAttempt,
    selectedQuizId,
    setSelectedQuizId,
    authMode,
    authRole,
    setAuthRole,
    user,
    openAuth,
    completeAuth,
    logout,
    goHome,
    joinQuiz,
    moveToQuestion,
    submitQuiz,
  };

  return (
    <div className="min-h-screen gradient-mesh">
      {view === "landing" && <Landing {...sharedProps} />}
      {view === "login" && <AuthPage {...sharedProps} mode="login" />}
      {view === "signup" && <AuthPage {...sharedProps} mode="signup" />}
      {view === "teacher" && <TeacherDashboard {...sharedProps} />}
      {view === "student" && <StudentJoin {...sharedProps} />}
      {view === "quiz" && <QuizTaking {...sharedProps} />}
      {view === "results" && <QuizResults {...sharedProps} />}
      {view === "analytics" && <TeacherAnalytics {...sharedProps} />}
    </div>
  );
}

function Landing({ openAuth }) {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="text-xl font-bold text-primary">Pace</span>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => openAuth("login", "teacher")}>
            Login
          </Button>
          <Button variant="outline" onClick={() => openAuth("signup", "teacher")}>
            Sign up
          </Button>
        </div>
      </div>
      <div className="flex justify-center pt-8">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((dot) => (
            <span key={dot} className="h-2 w-2 rounded-full bg-primary" />
          ))}
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
          <RoleCard
            title="I'm a Teacher"
            text="Log in to create quizzes and track student performance."
            icon="T"
            onClick={() => openAuth("login", "teacher")}
          />
          <RoleCard
            title="I'm a Student"
            text="Log in to join a quiz and test your knowledge."
            icon="S"
            onClick={() => openAuth("login", "student")}
          />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          New here?{" "}
          <button className="font-semibold text-primary hover:underline" onClick={() => openAuth("signup", "teacher")}>
            Create an account
          </button>
        </p>
      </section>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        Built for the Vercel v0 x AWS Databases Hackathon
      </footer>
    </main>
  );
}

function RoleCard({ title, text, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-2xl bg-card p-8 text-center scando-shadow-lg transition hover:-translate-y-1 hover:scando-shadow-primary"
    >
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary transition group-hover:bg-primary/15">
        {icon}
      </span>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
    </button>
  );
}

function AuthPage({ mode, authRole, setAuthRole, completeAuth, openAuth, goHome }) {
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isSignup && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    completeAuth({
      name,
      email: email.trim(),
      role: authRole,
    });
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Button variant="ghost" className="absolute left-6 top-6" onClick={goHome}>
        Back
      </Button>

      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            P
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            {isSignup ? "Create account" : "Welcome back"}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{isSignup ? "Sign up for Pace" : "Login to Pace"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose your role first, then continue into the right workspace.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          {["teacher", "student"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setAuthRole(role)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold capitalize transition ${
                authRole === role ? "bg-card text-primary scando-shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {isSignup && (
            <Field label="Name">
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" autoFocus />
            </Field>
          )}
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoFocus={!isSignup}
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
            />
          </Field>

          {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          <Button type="submit" className="mt-1">
            {isSignup ? `Create ${authRole} account` : `Login as ${authRole}`}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <button
            className="font-semibold text-primary hover:underline"
            onClick={() => openAuth(isSignup ? "login" : "signup", authRole)}
          >
            {isSignup ? "Login" : "Sign up"}
          </button>
        </p>
      </Card>
    </main>
  );
}

function TeacherDashboard({ quizzes, setQuizzes, attempts, setView, setSelectedQuizId, user, logout }) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [createdKey, setCreatedKey] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setDraftQuestions([]);
    setCreatedKey("");
  }

  function addQuestion() {
    if (!questionText.trim() || options.some((option) => !option.trim())) return;
    setDraftQuestions((prev) => [
      ...prev,
      {
        id: uid("question"),
        text: questionText.trim(),
        options: options.map((option) => option.trim()),
        correctAnswer,
      },
    ]);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  }

  function createQuiz() {
    if (!title.trim() || draftQuestions.length === 0) return;
    const accessKey = generateAccessKey();
    const quiz = {
      id: uid("quiz"),
      title: title.trim(),
      description: description.trim(),
      accessKey,
      isActive: true,
      createdAt: new Date().toISOString(),
      questions: draftQuestions,
    };
    setQuizzes((prev) => [quiz, ...prev]);
    setCreatedKey(accessKey);
  }

  function toggleQuiz(id) {
    setQuizzes((prev) =>
      prev.map((quiz) => (quiz.id === id ? { ...quiz, isActive: !quiz.isActive } : quiz))
    );
  }

  function deleteQuiz(id) {
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
  }

  return (
    <main className="min-h-screen">
      <Header title={`Teacher Dashboard${user?.name ? ` - ${user.name}` : ""}`} onBack={logout} actionLabel="Logout" />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Your Quizzes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create, share, and review learning patterns.</p>
          </div>
          <Button onClick={() => setCreating(true)}>Create New Quiz</Button>
        </div>

        {quizzes.length === 0 ? (
          <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              Q
            </div>
            <h3 className="text-xl font-bold">No quizzes yet</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Create your first quiz and Pace will start collecting score and timing insights once students submit answers.
            </p>
            <Button className="mt-6" onClick={() => setCreating(true)}>
              Create Your First Quiz
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz) => {
            const quizAttempts = attempts.filter((attempt) => attempt.quizId === quiz.id);
            return (
              <Card key={quiz.id} className={`p-5 ${quiz.isActive ? "border-l-4 border-l-success" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{quiz.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{quiz.description}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${quiz.isActive ? "bg-success text-white" : "bg-muted text-muted-foreground"}`}>
                    {quiz.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border px-2.5 py-1 font-mono text-foreground">{quiz.accessKey}</span>
                  <span className="rounded-full bg-muted px-2.5 py-1">{quiz.questions.length} questions</span>
                  <span className="rounded-full bg-muted px-2.5 py-1">{quizAttempts.length} attempts</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedQuizId(quiz.id);
                      setView("analytics");
                    }}
                  >
                    View Analytics
                  </Button>
                  <div className="flex gap-1">
                    <Button variant="ghost" onClick={() => toggleQuiz(quiz.id)}>
                      {quiz.isActive ? "Pause" : "Open"}
                    </Button>
                    <Button variant="danger" onClick={() => deleteQuiz(quiz.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
            })}
          </div>
        )}
      </section>

      {creating && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/30 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-auto p-6">
            {createdKey ? (
              <div className="text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-success">Quiz Created</p>
                <h3 className="mt-3 text-2xl font-bold">Share this access key</h3>
                <div className="mx-auto mt-6 w-fit rounded-2xl bg-primary/10 px-10 py-6 font-mono text-5xl font-bold tracking-[0.25em] text-primary">
                  {createdKey}
                </div>
                <div className="mt-8 flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setCreating(false);
                    }}
                  >
                    Done
                  </Button>
                  <Button
                    onClick={() => {
                      const quiz = quizzes.find((item) => item.accessKey === createdKey);
                      if (quiz) setSelectedQuizId(quiz.id);
                      resetForm();
                      setCreating(false);
                      setView("analytics");
                    }}
                  >
                    View Analytics
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">Create New Quiz</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Add quiz details and at least one question.</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      resetForm();
                      setCreating(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
                <div className="mt-6 grid gap-4">
                  <Field label="Title">
                    <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Introduction to Biology" />
                  </Field>
                  <Field label="Description">
                    <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this quiz about?" />
                  </Field>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <Field label="Question">
                      <Input value={questionText} onChange={(event) => setQuestionText(event.target.value)} placeholder="Type your question" />
                    </Field>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {labels.map((label, index) => (
                        <Field key={label} label={`Option ${label}`}>
                          <Input
                            value={options[index]}
                            onChange={(event) =>
                              setOptions((prev) => prev.map((item, i) => (i === index ? event.target.value : item)))
                            }
                          />
                        </Field>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="mr-2 text-sm font-medium">Correct answer</span>
                      {labels.map((label, index) => (
                        <button
                          key={label}
                          onClick={() => setCorrectAnswer(index)}
                          className={`h-9 w-9 rounded-full text-sm font-bold transition ${correctAnswer === index ? "bg-primary text-primary-foreground" : "bg-card"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-4 w-full" onClick={addQuestion}>
                      Add Question
                    </Button>
                  </div>

                  {draftQuestions.length > 0 && (
                    <div className="grid gap-2">
                      {draftQuestions.map((question, index) => (
                        <div key={question.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-3 text-sm">
                          <span className="truncate">
                            {index + 1}. {question.text}
                          </span>
                          <Button
                            variant="danger"
                            className="px-2 py-1"
                            onClick={() => setDraftQuestions((prev) => prev.filter((_, i) => i !== index))}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button disabled={!title.trim() || draftQuestions.length === 0} onClick={createQuiz}>
                    Finish and Create Quiz
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </main>
  );
}

function StudentJoin({ joinQuiz, user, logout }) {
  const [name, setName] = useState(user?.name || "");
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");

  function handleJoin(key = accessKey, person = name) {
    setError("");
    if (!person.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!joinQuiz(key, person)) setError("Invalid or inactive access key. Please check with your teacher.");
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Button variant="ghost" className="absolute left-6 top-6" onClick={logout}>
        Logout
      </Button>
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Join a Quiz</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter the access key provided by your teacher.</p>
        <div className="mt-6 grid gap-5">
          <Field label="Your Name">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" autoFocus />
          </Field>
          <Field label="Access Key">
            <Input
              value={accessKey}
              onChange={(event) => setAccessKey(event.target.value.toUpperCase())}
              placeholder="ABC123"
              className="tracking-[0.3em]"
            />
          </Field>
          <Button onClick={() => handleJoin()}>Join Quiz</Button>
          {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        </div>
      </Card>
    </main>
  );
}

function QuizTaking({ currentQuiz, questionIndex, studentAnswers, setStudentAnswers, moveToQuestion, submitQuiz }) {
  if (!currentQuiz) {
    return <EmptyState title="No quiz loaded" text="Go back and join a quiz first." />;
  }

  const question = currentQuiz.questions[questionIndex];
  const selectedAnswer = studentAnswers[questionIndex];
  const total = currentQuiz.questions.length;
  const answeredCount = studentAnswers.filter((answer) => answer !== null).length;
  const progress = ((questionIndex + 1) / total) * 100;
  const isLast = questionIndex === total - 1;

  function selectAnswer(index) {
    setStudentAnswers((prev) => prev.map((answer, i) => (i === questionIndex ? index : answer)));
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <strong className="text-lg text-primary">Pace</strong>
          <div className="w-full max-w-xs">
            <p className="text-center text-xs text-muted-foreground">
              Question {questionIndex + 1} of {total}
            </p>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {isLast ? <Button onClick={submitQuiz}>Submit</Button> : <div className="w-20" />}
        </div>
      </header>

      <div className="border-b border-border bg-background/70">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2 px-4 py-3">
          {currentQuiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => moveToQuestion(index)}
              className={`h-9 min-w-9 rounded-full px-2 text-xs font-bold transition ${
                index === questionIndex
                  ? "bg-primary text-primary-foreground"
                  : studentAnswers[index] !== null
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              Q{index + 1}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10">
        <div className="mb-6 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
            Q{questionIndex + 1}
          </span>
          <h1 className="text-xl font-semibold leading-relaxed sm:text-2xl">{question.text}</h1>
        </div>
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <button
              key={option}
              onClick={() => selectAnswer(index)}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                selectedAnswer === index
                  ? "border-primary bg-primary text-primary-foreground scando-shadow-primary"
                  : "border-border bg-card scando-shadow hover:bg-accent/50"
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${selectedAnswer === index ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                {labels[index]}
              </span>
              <span>{option}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="sticky bottom-0 border-t border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Button variant="outline" disabled={questionIndex === 0} onClick={() => moveToQuestion(questionIndex - 1)}>
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">{answeredCount} answered</span>
          {isLast ? (
            <Button disabled={selectedAnswer === null} onClick={submitQuiz}>
              Submit Quiz
            </Button>
          ) : (
            <Button disabled={selectedAnswer === null} onClick={() => moveToQuestion(questionIndex + 1)}>
              Next
            </Button>
          )}
        </div>
      </footer>
    </main>
  );
}

function QuizResults({ currentAttempt, goHome, setView }) {
  if (!currentAttempt) return <EmptyState title="No result yet" text="Complete a quiz to see your result." />;

  const percent = Math.round((currentAttempt.totalScore / currentAttempt.totalQuestions) * 100);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-4 py-10">
      <Card className="p-6 sm:p-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Quiz Complete</p>
          <h1 className="mt-3 text-4xl font-bold">{percent}%</h1>
          <p className="mt-2 text-muted-foreground">
            {currentAttempt.totalScore} of {currentAttempt.totalQuestions} correct in {formatTime(currentAttempt.totalTime)}
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat label="Score" value={`${currentAttempt.totalScore}/${currentAttempt.totalQuestions}`} />
          <Stat label="Accuracy" value={`${percent}%`} />
          <Stat label="Total Time" value={formatTime(currentAttempt.totalTime)} />
        </div>

        <div className="mt-8 grid gap-3">
          {currentAttempt.answers.map((answer) => (
            <div key={answer.questionId} className="rounded-2xl border border-border bg-muted/35 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="font-medium">{answer.questionText}</p>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${answer.isCorrect ? "bg-success text-white" : "bg-destructive text-white"}`}>
                  {answer.isCorrect ? "Correct" : "Review"}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Your answer: {answer.selectedAnswer === null ? "No answer" : answer.options[answer.selectedAnswer]} | Time: {formatTime(answer.timeSpent)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="outline" onClick={goHome}>
            Back Home
          </Button>
          <Button onClick={() => setView("student")}>Try Another Quiz</Button>
        </div>
      </Card>
    </main>
  );
}

function TeacherAnalytics({ quizzes, attempts, selectedQuizId, setSelectedQuizId, setView }) {
  const quiz = quizzes.find((item) => item.id === selectedQuizId) || quizzes[0];
  const quizAttempts = attempts.filter((attempt) => attempt.quizId === quiz?.id);

  const stats = useMemo(() => {
    if (!quiz || quizAttempts.length === 0) {
      return { averageScore: 0, averageTime: 0, hardestQuestion: "No attempts yet" };
    }

    const averageScore = Math.round(
      quizAttempts.reduce((sum, attempt) => sum + (attempt.totalScore / attempt.totalQuestions) * 100, 0) /
        quizAttempts.length
    );
    const averageTime = Math.round(
      quizAttempts.reduce((sum, attempt) => sum + attempt.totalTime, 0) / quizAttempts.length
    );
    const questionMisses = quiz.questions.map((question, index) => {
      const misses = quizAttempts.filter((attempt) => !attempt.answers[index]?.isCorrect).length;
      return { text: question.text, misses };
    });
    questionMisses.sort((a, b) => b.misses - a.misses);
    return { averageScore, averageTime, hardestQuestion: questionMisses[0]?.text || "No attempts yet" };
  }, [quiz, quizAttempts]);

  if (!quiz) {
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold">No quizzes yet</h1>
          <p className="mt-2 text-muted-foreground">Create a quiz first to see analytics.</p>
          <Button className="mt-6" onClick={() => setView("teacher")}>
            Back to Dashboard
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header title="Teacher Analytics" onBack={() => setView("teacher")} />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Access key {quiz.accessKey}</p>
          </div>
          <select
            className="h-11 rounded-xl border border-input bg-card px-3 text-sm"
            value={quiz.id}
            onChange={(event) => setSelectedQuizId(event.target.value)}
          >
            {quizzes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Stat label="Attempts" value={quizAttempts.length} />
          <Stat label="Avg Score" value={`${stats.averageScore}%`} />
          <Stat label="Avg Time" value={formatTime(stats.averageTime)} />
          <Stat label="Questions" value={quiz.questions.length} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-5">
            <h2 className="text-lg font-bold">Question Timing</h2>
            <div className="mt-5 grid gap-4">
              {quiz.questions.map((question, index) => {
                const times = quizAttempts.map((attempt) => attempt.answers[index]?.timeSpent || 0);
                const average = times.length ? Math.round(times.reduce((sum, time) => sum + time, 0) / times.length) : 0;
                const width = Math.min(100, average * 5);
                return (
                  <div key={question.id}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span className="truncate">{question.text}</span>
                      <strong>{quizAttempts.length ? formatTime(average) : "-"}</strong>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-bold">Learning Signals</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The toughest question right now appears to be:
            </p>
            <p className="mt-3 rounded-2xl bg-accent p-4 font-medium">{stats.hardestQuestion}</p>
            <div className="mt-5 grid gap-3">
              {quizAttempts.length === 0 ? (
                <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                  No student attempts yet. Use the student demo flow with access key {quiz.accessKey} to generate analytics.
                </p>
              ) : (
                quizAttempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-2xl border border-border p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{attempt.studentName}</strong>
                      <span>
                        {attempt.totalScore}/{attempt.totalQuestions}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{formatTime(attempt.totalTime)}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

function Header({ title, onBack, actionLabel = "Back" }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <Button variant="ghost" onClick={onBack}>
          {actionLabel}
        </Button>
        <div>
          <p className="text-xl font-bold leading-none">Pace</p>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </header>
  );
}

function EmptyState({ title, text }) {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{text}</p>
      </Card>
    </main>
  );
}
