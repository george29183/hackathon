"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Header, Stat } from "@/components/ui";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function MonitorQuiz() {
  const { quizId } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [chartData, setChartData] = useState([]);

    useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/session/${quizId}`);
        if (res.data.success) {
          setQuiz(res.data.quiz);
          setSessions(res.data.sessions);
          
          // Process chart data...
          if (res.data.quiz.questions) {
            const times = Array(res.data.quiz.questions.length).fill(0);
            let validSubmissions = 0;
            res.data.sessions.forEach(s => {
              if (s.gradedAnswers) {
                validSubmissions++;
                s.gradedAnswers.forEach((ans, i) => { times[i] += ans.timeSpent || 0; });
              }
            });
            const data = res.data.quiz.questions.map((q, i) => ({
              name: `Q${i+1}`,
              time: validSubmissions > 0 ? Math.round(times[i] / validSubmissions) : 0
            }));
            setChartData(data);
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };

    fetchData(); // Fetch immediately

    // NEW: Only fetch if the lecturer is actively looking at the tab
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [quizId]);


  const fetchAISummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await axios.get(`/api/session/ai-summary/${quizId}`);
      if (res.data.success) setAiSummary(res.data.summary);
    } catch (err) { setAiSummary("<p>Failed to generate summary.</p>"); }
    finally { setLoadingSummary(false); }
  };

  // UPGRADED & SAFE CSV Export Function
  const exportCSV = () => {
    if (!quiz || sessions.length === 0) return;
    
    // Helper to escape fields containing commas or quotes
    const escapeCsv = (str) => {
      const s = String(str || "");
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`; // Wrap in quotes and double any internal quotes
      }
      return s;
    };

    let csv = "Student Email,Score,Integrity Risk,";
    quiz.questions.forEach((_, i) => {
      csv += `Q${i+1} Answer,Q${i+1} Time(s),Q${i+1} Changed?,Q${i+1} Presence,`;
    });
    csv += "\n";

    sessions.forEach(s => {
      csv += `${escapeCsv(s.studentEmail)},${s.score}/${s.totalQuestions},${s.integrityRisk || 0},`;
      if (s.gradedAnswers) {
        s.gradedAnswers.forEach(ans => {
          csv += `${escapeCsv(ans.selectedAnswer)},${ans.timeSpent},${ans.isChanged ? 'Yes' : 'No'},${ans.answeredPresence || 'active'},`;
        });
      }
      csv += "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.replace(/\s/g, '_')}_analytics.csv`;
    a.click();
    window.URL.revokeObjectURL(url); // Clean up memory
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center gradient-mesh">Loading...</div>;
  if (!quiz) return <div className="min-h-screen flex items-center justify-center">Quiz not found.</div>;

  const getCellColor = (answer) => {
    if (!answer) return "bg-muted";
    if (!answer.isCorrect) return "bg-destructive/10 text-destructive";
    if (answer.timeSpent > 30) return "bg-warning/15 text-warning-foreground";
    return "bg-success/15 text-success";
  };

  return (
    <main className="min-h-screen gradient-mesh">
      <Header title="Teacher Analytics" onBack={() => router.push("/lecturer/dashboard")} />
      
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Access key {quiz.quizCode}</p>
          </div>
          <Button variant="outline" onClick={exportCSV} disabled={sessions.length === 0}>
            ⬇️ Export CSV
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-4 mb-8">
          <Stat label="Submissions" value={sessions.length} />
          <Stat label="Avg Score" value={sessions.length > 0 ? `${Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / sessions.length)}%` : "0%"} />
          <Stat label="Questions" value={quiz.questions.length} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="p-5">
            <h2 className="text-lg font-bold mb-4">Avg Time Per Question (Seconds)</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip wrapperStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="time" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">AI Professor's Report</h2>
              <Button size="sm" onClick={fetchAISummary} disabled={loadingSummary}>
                {loadingSummary ? "Analyzing..." : "Generate Summary"}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground prose prose-sm max-w-none grow" dangerouslySetInnerHTML={{ __html: aiSummary || "<p>Click 'Generate Summary' to let AI analyze student performance and provide insights.</p>" }} />
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="text-lg font-bold mb-4">Live Heatmap</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground border-r">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground border-r">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground border-r whitespace-nowrap">Presence</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground border-r">Risk</th>
                  {quiz.questions.map((_, qIndex) => (
                    <th key={qIndex} className="px-4 py-3 text-center font-medium text-muted-foreground border-r min-w-20">Q{qIndex + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
              {sessions.length === 0 && (
                  <tr>
                    <td colSpan={quiz.questions.length + 4} className="py-12">
                      <div className="flex flex-col items-center justify-center text-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground animate-pulse">
                          ⏳
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Waiting for students...</h3>
                        <p className="text-sm text-muted-foreground">Share the access key <span className="font-mono font-bold text-primary">{quiz.quizCode}</span> with your students to begin.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {sessions.map((session) => {
                  const isOnline = session.lastSeen && (Date.now() - new Date(session.lastSeen).getTime() < 15000);
                  let presenceBadge = <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Offline</span>;
                  if (isOnline && session.status === "in_progress") {
                    if (session.presence === "tab_switched") presenceBadge = <span className="text-xs bg-warning/20 text-warning-foreground px-2 py-1 rounded-full motion-safe:animate-pulse">⚠️ Tab Switched</span>;
                    else if (session.presence === "window_blur") 
                      presenceBadge = <span className="text-xs bg-purple-200 text-purple-900 px-2 py-1 rounded-full motion-safe:animate-pulse">💻 Left App</span>;
                    else if (session.presence === "copy_paste_attempt") 
                      presenceBadge = <span className="text-xs bg-red-200 text-red-900 px-2 py-1 rounded-full motion-safe:animate-pulse">📋 Copy/Paste</span>;
                    else if (session.presence === "disconnected") presenceBadge = <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full motion-safe:animate-pulse">🔴 Disconnected</span>;
                    else if (session.presence === "not_fullscreen")
                      presenceBadge = <span className="text-xs bg-orange-200 text-orange-900 px-2 py-1 rounded-full motion-safe:animate-pulse">🖵 Windowed</span>;
                    else presenceBadge = <span className="text-xs bg-success/15 text-success px-2 py-1 rounded-full motion-safe:animate-pulse">🟢 Active</span>;
                  } else if (session.status === "completed") {
                    presenceBadge = <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Completed</span>;
                  }

                  return (
                    <tr key={session.sessionId} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground border-r whitespace-nowrap">{session.studentEmail}</td>
                      <td className="px-4 py-3 text-muted-foreground border-r font-semibold">{session.score !== undefined ? `${session.score}/${session.totalQuestions}` : "-"}</td>
                      <td className="px-4 py-3 border-r whitespace-nowrap">{presenceBadge}</td>

                         {/* NEW: Integrity Risk Score Cell */}
                      <td className="px-4 py-3 text-center border-r whitespace-nowrap">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                          session.integrityRisk > 60 ? 'bg-destructive/15 text-destructive' :
                          session.integrityRisk > 30 ? 'bg-warning/15 text-warning-foreground' :
                          'bg-success/15 text-success'
                        }`}>
                          {session.integrityRisk || 0}%
                        </span>
                      </td>

                      {session.gradedAnswers ? (
                        session.gradedAnswers.map((ans, aIndex) => (
                          <td key={aIndex} className={`px-4 py-3 text-center border-r font-mono ${getCellColor(ans)}`}>
                            {ans.timeSpent}s
                            {/* NEW: Show pencil icon if answer was changed */}
                            {ans.isChanged && <span className="ml-1" title={`Changed answer. Visited ${ans.timePerVisit?.length || 1} times.`}>✏️</span>}
                            {ans.answeredPresence === "tab_switched" && (
                              <span className="ml-1 text-orange-600" title="Answered while looking at another window!">🕵️</span>
                            )}
                            {ans.answeredPresence === "not_fullscreen" && (
                              <span className="ml-1 text-orange-600" title="Answered while not in fullscreen!">🖵</span>
                            )}
                            {ans.answeredPresence === "window_blur" && <span className="ml-1 text-purple-600" title="Clicked out of browser">💻</span>}
                            {ans.answeredPresence === "copy_paste_attempt" && <span className="ml-1 text-red-600" title="Tried to Copy/Paste">📋</span>}
                          </td>
                        ))
                      ) : (
                        // Live tracking for in-progress students
                        quiz.questions.map((_, qIndex) => {
                          const qData = session.questionData?.[qIndex];
                          const isAnswered = qData && qData.selectedAnswer !== null;
                          return (
                            <td key={qIndex} className={`px-4 py-3 text-center border-r ${isAnswered ? "bg-primary/10 text-primary font-medium" : "bg-muted text-muted-foreground/30"}`}>
                              {isAnswered ? (qData.isChanged ? "✏️" : "✓") : "..."}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex gap-4 mt-4 text-xs text-muted-foreground justify-end flex-wrap">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-success/15 rounded-sm"></div> Fast & Correct</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-warning/15 rounded-sm"></div> Slow/Hesitant--correct</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-destructive/10 rounded-sm"></div> Incorrect</div>
          <div className="flex items-center gap-1">✏️ Answer Changed</div>
          <div className="flex items-center gap-1">🕵️ Tab Switched</div>
          <div className="flex items-center gap-1">🖵 Not Fullscreen</div>
          <div className="flex items-center gap-1">💻 Window Blurred(opened other app)</div>
          <div className="flex items-center gap-1">📋 Copy/Paste Attempt</div>
        </div>
      </section>
    </main>
  );
}