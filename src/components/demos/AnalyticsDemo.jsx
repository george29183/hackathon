"use client";
import { useState, useEffect, useRef } from "react";
import { Card, Button, Stat } from "@/components/ui";

export function AnalyticsDemo() {
  const [students, setStudents] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [csvClicked, setCsvClicked] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const timeoutIds = useRef([]);

  const waitTracked = (ms) => new Promise(resolve => {
    const id = setTimeout(resolve, ms);
    timeoutIds.current.push(id);
  });

  useEffect(() => {
    let isMounted = true;

    const typeText = async (text, setter) => {
      for (let i = 0; i <= text.length; i++) {
        if (!isMounted) return;
        setter(text.substring(0, i));
        await waitTracked(15);
      }
    };

    const runSequence = async () => {
      while (isMounted) {
        // Reset
        setStudents([]);
        setShowSummary(false);
        setCsvClicked(false);
        setSummaryText("");
        await waitTracked(1000);

        // Student 1 Joins
        setStudents([{
          email: "alex@uni.edu", score: "3/3", risk: 0, riskColor: "bg-success/15 text-success",
          answers: [{ t: "15s", c: "bg-success/40" }, { t: "20s", c: "bg-success/40" }, { t: "30s", c: "bg-success/40" }]
        }]);
        await waitTracked(1500);

        // Student 2 Joins
        setStudents(prev => [...prev, {
          email: "sam@uni.edu", score: "2/3", risk: 25, riskColor: "bg-warning/15 text-warning-foreground",
          answers: [{ t: "10s", c: "bg-success/40" }, { t: "45s", c: "bg-warning/40" }, { t: "0s", c: "bg-destructive/40" }]
        }]);
        await waitTracked(1500);

        // Student 3 Joins (Cheater)
        setStudents(prev => [...prev, {
          email: "john@uni.edu", score: "2/3", risk: 68, riskColor: "bg-destructive/15 text-destructive animate-pulse",
          answers: [{ t: "3s", c: "bg-success/40" }, { t: "60s", c: "bg-destructive/40" }, { t: "5s", c: "bg-success/40" }]
        }]);
        await waitTracked(2000);

        // AI Summary Generates
        setShowSummary(true);
        await typeText("Students struggled most with Q2 (60s avg). 1 integrity flag detected for john@uni.edu (tab switch).", setSummaryText);
        await waitTracked(2000);

        // CSV Export Clicks Itself
        setCsvClicked(true);
        await waitTracked(2500);
      }
    };

    runSequence();

    return () => {
      isMounted = false;
      timeoutIds.current.forEach(id => clearTimeout(id));
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Card className="p-6 h-[520px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold">Live Analytics</h3>
            <p className="text-xs text-muted-foreground">Access key AIQU-1A2B3C</p>
          </div>
          <Button 
            size="sm" 
            variant={csvClicked ? "secondary" : "outline"}
            className={csvClicked ? "bg-success/15 text-success border-success/30" : "animate-pulse"}
          >
            {csvClicked ? "✓ Exported CSV" : "⬇️ Export CSV"}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-muted/70 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Submissions</p>
            <p className="text-xl font-bold">{students.length}</p>
          </div>
          <div className="bg-muted/70 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Avg Score</p>
            <p className="text-xl font-bold">83%</p>
          </div>
          <div className="bg-muted/70 p-3 rounded-xl text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Flags</p>
            <p className="text-xl font-bold text-destructive">1</p>
          </div>
        </div>

        {/* Heatmap Table */}
        <div className="flex-1 overflow-hidden border border-border rounded-xl">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground border-r">Student</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground border-r">Score</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground border-r">Risk</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground border-r">Q1</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground border-r">Q2</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">Q3</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Waiting for students to join...
                  </td>
                </tr>
              )}
              {students.map((s, i) => (
                <tr key={i} className="border-b animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <td className="px-3 py-3 font-medium text-foreground border-r truncate max-w-[120px]">{s.email}</td>
                  <td className="px-3 py-3 text-muted-foreground border-r font-semibold">{s.score}</td>
                  <td className="px-3 py-3 text-center border-r">
                    <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-bold ${s.riskColor}`}>
                      {s.risk}%
                    </span>
                  </td>
                  {s.answers.map((ans, idx) => (
                    <td key={idx} className={`px-3 py-3 text-center border-r font-mono ${ans.c} ${idx === 2 ? 'border-r-0' : ''}`}>
                      {ans.t}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Summary Box */}
        {showSummary && (
          <div className="mt-4 p-4 bg-muted/50 rounded-xl border border-border animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">🤖 AI Professor's Report</p>
            <p className="text-xs text-muted-foreground">{summaryText}<span className="animate-pulse">|</span></p>
          </div>
        )}
      </Card>
    </div>
  );
}