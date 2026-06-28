"use client";
import { useState, useEffect, useRef } from "react";
import { Card, Input, Button, Field } from "@/components/ui";

export function QuizGenDemo() {
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const generateBtnRef = useRef(null);
  const timeoutIds = useRef([]);
  const [screen, setScreen] = useState("form"); // 'form', 'loading', 'success'
  const [cursorPos, setCursorPos] = useState({ top: 20, left: 20, hide: true });
  const [fileName, setFileName] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");

   const wait = (ms) => new Promise(resolve => {
    const id = setTimeout(resolve, ms);
    timeoutIds.current.push(id);
  });


  const moveTo = (ref) => {
    if (!ref.current || !containerRef.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const childRect = ref.current.getBoundingClientRect();
    setCursorPos({
      top: childRect.top - parentRect.top + childRect.height / 2 - 12,
      left: childRect.left - parentRect.left + childRect.width / 2 - 12,
      hide: false
    });
  };

  useEffect(() => {
    let isMounted = true;

    const runSequence = async () => {
      while (isMounted) {
        // 1. Start at Form
        setScreen("form");
        setFileName("");
        setDifficulty("Medium");
        setCursorPos(p => ({ ...p, hide: true }));
        await wait(1500);

        // 2. Move to File Input & "Upload"
        moveTo(fileInputRef);
        await wait(800);
        setCursorPos(p => ({ ...p, click: true }));
        await wait(200);
        setCursorPos(p => ({ ...p, click: false }));
        
        // Simulate file selected
        for (let i = 0; i < 15; i++) {
          if (!isMounted) return;
          await wait(20);
        }
        setFileName("lecture_notes.pdf");
        await wait(800);

        // 3. Change Difficulty (just visual feedback)
        setDifficulty("Hard");
        await wait(600);

        // 4. Move to Generate Button & Click
        moveTo(generateBtnRef);
        await wait(700);
        setCursorPos(p => ({ ...p, click: true }));
        await wait(200);
        setCursorPos(p => ({ ...p, click: false }));

        // 5. Loading State
        setScreen("loading");
        setCursorPos(p => ({ ...p, hide: true }));
        await wait(3500); // AI thinking...

        // 6. Success State
        setScreen("success");
        await wait(3000);
      }
    };

    runSequence();

    return () => { 
      isMounted = false; 
     timeoutIds.current.forEach(id => clearTimeout(id));
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto h-[520px]">
      {/* Ghost Cursor */}
      <svg 
        className={`absolute z-30 pointer-events-none transition-all duration-700 ease-in-out ${cursorPos.hide ? 'opacity-0' : 'opacity-100'} ${cursorPos.click ? 'scale-90' : 'scale-100'}`}
        style={{ top: cursorPos.top, left: cursorPos.left }}
        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" className="text-primary fill-primary/20" />
      </svg>

      <Card className="p-8 h-full flex flex-col justify-center">
        {screen === "form" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">AI</div>
              <h3 className="text-2xl font-bold">AI Quiz Generator</h3>
              <p className="text-sm text-muted-foreground">Upload lecture notes and let AI build the quiz.</p>
            </div>

            <Field label="Upload Lecture PDF">
              <div 
                ref={fileInputRef} 
                className={`mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-3 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 cursor-pointer border border-dashed border-border rounded-xl p-2 transition ${fileName ? 'bg-muted/50' : ''}`}
              >
                {fileName ? `📄 ${fileName}` : "Click to upload PDF"}
              </div>
            </Field>

            <Field label="Difficulty Level">
              <select 
                value={difficulty} 
                readOnly 
                className="h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 w-full"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </Field>

            <Button ref={generateBtnRef} className="w-full mt-2">
              Generate Custom AI Quiz
            </Button>
          </div>
        )}

        {screen === "loading" && (
          <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-50 duration-300 space-y-6">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold">AI is generating quiz...</h3>
            <p className="text-sm text-muted-foreground">Analyzing PDF and creating questions.</p>
          </div>
        )}

        {screen === "success" && (
          <div className="text-center animate-in fade-in zoom-in-50 duration-300 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-3xl font-bold text-success animate-pulse">✓</div>
            <h3 className="text-2xl font-bold">Quiz Created!</h3>
            <div className="bg-muted/50 p-4 rounded-xl border border-border text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Title:</span> <span className="font-bold">AI Generated Quiz</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Questions:</span> <span className="font-bold">5</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Code:</span> <span className="font-mono font-bold text-primary">AIQU-1A2B3C</span></div>
            </div>
            <p className="text-muted-foreground">Redirecting to Dashboard...</p>
          </div>
        )}
      </Card>
    </div>
  );
}