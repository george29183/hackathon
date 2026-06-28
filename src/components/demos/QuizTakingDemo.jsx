"use client";
import { useState, useEffect, useRef } from "react";
import { Card, Button } from "@/components/ui";

export function QuizTakingDemo() {
  const [step, setStep] = useState(0); // 0 = Q1, 1 = Q2, 2 = Results
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15); // Start at 15s
  const [showWarning, setShowWarning] = useState(false);
  const [pulseBtn, setPulseBtn] = useState(false);
  
  const timeoutIds = useRef([]);
  const waitTracked = (ms) => new Promise(resolve => {
    const id = setTimeout(resolve, ms);
    timeoutIds.current.push(id);
  });

  const questions = [
    { text: "What is the capital of France?", options: ["London", "Paris", "Berlin", "Madrid"], correct: "Paris" },
    { text: "What is 2 + 2?", options: ["3", "4", "5", "22"], correct: "4" }
  ];

  useEffect(() => {
    let isMounted = true;

    const runSequence = async () => {
      while (isMounted) {
        // --- Q1 Phase ---
        setStep(0);
        setSelected(null);
        setShowWarning(false);
        setPulseBtn(false);
        setTimeLeft(15); 
        await waitTracked(2000);

        // Tab Switch Warning
        setShowWarning(true);
        await waitTracked(2000);
        setShowWarning(false);
        await waitTracked(1000);

        // Auto-select Q1
        setSelected(questions[0].correct);
        await waitTracked(1000);
        
        // Pulse Next Button
        setPulseBtn(true);
        await waitTracked(800);
        setPulseBtn(false);

        // --- Q2 Phase ---
        setStep(1);
        setSelected(null);
        setTimeLeft(11); // Timer continues smoothly
        await waitTracked(2000);

        // Auto-select Q2
        setSelected(questions[1].correct);
        await waitTracked(1000);
        
        // Pulse Submit Button
        setPulseBtn(true);
        await waitTracked(800);
        setPulseBtn(false);

        // --- Results Phase ---
        setStep(2);
        await waitTracked(4500);
      }
    };

    runSequence();

    // Smooth timer interval independent of the main loop
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timerInterval);
      timeoutIds.current.forEach(id => clearTimeout(id));
    };
  }, []);

  const currentQ = questions[step];

  return (
    <div className="relative w-full max-w-md mx-auto h-150">
      <Card className="p-0 h-full flex flex-col overflow-hidden">
        {/* Header / Timer */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <span className="text-sm font-bold text-primary">Pace</span>
          <div className={`px-3 py-1.5 rounded-full font-mono font-bold text-sm transition-colors ${timeLeft < 10 ? 'bg-destructive/10 text-destructive motion-safe:animate-pulse' : 'bg-muted text-muted-foreground'}`}>
            00:{timeLeft.toString().padStart(2, '0')}
          </div>
          <div className="w-20 text-right text-xs text-muted-foreground">
            {step < 2 ? `Question ${step + 1} of 2` : "Completed"}
          </div>
        </div>

        {/* Proctoring Warning Toast */}
        {showWarning && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 motion-safe:animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-destructive/40 border border-destructive/30 text-destructive text-xs font-bold px-4 py-2 rounded-full scando-shadow-lg flex items-center gap-2">
              ⚠️ Tab Switch Detected!
            </div>
          </div>
        )}

        {step < 2 ? (
          <div className="flex-1 p-6 flex flex-col">
            <div className="mb-8 flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground text-sm">Q{step + 1}</span>
              <h3 className="text-lg font-semibold leading-relaxed text-foreground">{currentQ.text}</h3>
            </div>
            
            <div className="grid gap-3 flex-1">
              {currentQ.options.map((opt, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                    selected === opt
                      ? "border-primary bg-primary text-primary-foreground scando-shadow-primary"
                      : "border-border bg-card"
                  }`}
                >
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${selected === opt ? "bg-white/20" : "bg-muted text-muted-foreground"}`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-sm font-medium">{opt}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Button variant="outline" disabled className="opacity-50">Previous</Button>
              <Button 
                disabled={!selected} 
                className={`transition-all ${!selected ? 'opacity-50' : ''} ${pulseBtn ? 'scale-95 ring-4 ring-primary/30' : 'scale-100'}`}
              >
                {step === 0 ? "Next Question" : "Submit Quiz"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center motion-safe:animate-in fade-in zoom-in-50 duration-500">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-3xl font-bold text-success motion-safe:animate-pulse">✓</div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Quiz Complete</p>
            <h1 className="mt-2 text-5xl font-bold">100%</h1>
            <p className="mt-3 text-muted-foreground">You scored 2 out of 2</p>
            
            <div className="mt-8 w-full p-4 bg-muted/50 rounded-xl border border-border text-left space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Time Spent:</span>
                <span className="font-bold text-foreground">00:12</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Integrity Status:</span>
                <span className="font-bold text-destructive flex items-center gap-1">🕵️ 1 Tab Switch Flag</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}