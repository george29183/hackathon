"use client";
import { useState, useEffect, useRef } from "react";
import { Card, Input, Button, Field } from "@/components/ui";

export function AuthDemo() {
  const containerRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const submitRef = useRef(null);
  const verifyBtnRef = useRef(null);
  const timeoutIds = useRef([]);
  const [screen, setScreen] = useState("signup"); // 'signup', 'verify', 'login', 'success'
  const [cursorPos, setCursorPos] = useState({ top: 20, left: 20, hide: true });
  const [typing, setTyping] = useState("");
  const [activeInput, setActiveInput] = useState(null);

   const wait = (ms) => new Promise(resolve => {
    const id = setTimeout(resolve, ms);
    timeoutIds.current.push(id);
  });


  // Helper to move cursor to the center of an element
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

  // The Animation Engine
  useEffect(() => {
    let isMounted = true;
    
    const typeText = async (text, setter) => {
      for (let i = 0; i <= text.length; i++) {
        if (!isMounted) return;
        setter(text.substring(0, i));
        await wait(60);
      }
    };

    const runSequence = async () => {
      while (isMounted) {
        // --- SIGNUP PHASE ---
        setScreen("signup");
        setCursorPos(p => ({ ...p, hide: true }));
        await wait(1000);

        // 1. Name
        setActiveInput("name");
        moveTo(nameRef);
        await wait(800);
        await typeText("Alex Doe", (val) => setTyping(prev => ({ ...prev, name: val })));
        setActiveInput(null);

        // 2. Email
        setActiveInput("email");
        moveTo(emailRef);
        await wait(500);
        await typeText("alex@uni.edu", (val) => setTyping(prev => ({ ...prev, email: val })));
        setActiveInput(null);

        // 3. Password
        setActiveInput("pass");
        moveTo(passRef);
        await wait(500);
        await typeText("password123", (val) => setTyping(prev => ({ ...prev, pass: val })));
        setActiveInput(null);

        // 4. Submit
        moveTo(submitRef);
        await wait(600);
        // Simulate click
        setCursorPos(p => ({ ...p, click: true }));
        await wait(200);
        setCursorPos(p => ({ ...p, click: false }));
        setTyping({}); // Clear inputs

        // --- VERIFY PHASE ---
        await wait(800);
        setScreen("verify");
        setCursorPos(p => ({ ...p, hide: true }));
        await wait(1500);
        moveTo(verifyBtnRef);
        await wait(800);
        setCursorPos(p => ({ ...p, click: true }));
        await wait(200);
        setCursorPos(p => ({ ...p, click: false }));

        // --- LOGIN PHASE ---
        await wait(800);
        setScreen("login");
        setCursorPos(p => ({ ...p, hide: true }));
        await wait(1000);

        // Login Email
        setActiveInput("email");
        moveTo(emailRef);
        await wait(500);
        await typeText("alex@uni.edu", (val) => setTyping(prev => ({ ...prev, email: val })));
        setActiveInput(null);

        // Login Pass
        setActiveInput("pass");
        moveTo(passRef);
        await wait(500);
        await typeText("password123", (val) => setTyping(prev => ({ ...prev, pass: val })));
        setActiveInput(null);

        // Login Submit
        moveTo(submitRef);
        await wait(600);
        setCursorPos(p => ({ ...p, click: true }));
        await wait(200);
        setCursorPos(p => ({ ...p, click: false }));
        setTyping({});

        // --- SUCCESS PHASE ---
        await wait(800);
        setScreen("success");
        setCursorPos(p => ({ ...p, hide: true }));
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
    <div ref={containerRef} className="relative w-full max-w-md mx-auto h-[480px]">
      {/* The Ghost Cursor */}
      <svg 
        className={`absolute z-30 pointer-events-none transition-all duration-700 ease-in-out ${cursorPos.hide ? 'opacity-0' : 'opacity-100'} ${cursorPos.click ? 'scale-90' : 'scale-100'}`}
        style={{ top: cursorPos.top, left: cursorPos.left }}
        width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" className="text-primary fill-primary/20" />
      </svg>

      <Card className="p-8 h-full flex flex-col justify-center">
        {screen === "signup" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold">Create Student Account</h3>
              <p className="text-sm text-muted-foreground">Create an account to join quizzes.</p>
            </div>
            <Field label="Username">
              <Input ref={nameRef} placeholder="Your name" value={typing.name || ""} readOnly className={`${activeInput === "name" ? "ring-4 ring-primary/15 border-primary" : ""}`} />
            </Field>
            <Field label="Email">
              <Input ref={emailRef} type="email" placeholder="you@example.com" value={typing.email || ""} readOnly className={`${activeInput === "email" ? "ring-4 ring-primary/15 border-primary" : ""}`} />
            </Field>
            <Field label="Password">
              <Input ref={passRef} type="password" placeholder="At least 6 characters" value={typing.pass || ""} readOnly className={`${activeInput === "pass" ? "ring-4 ring-primary/15 border-primary" : ""}`} />
            </Field>
            <Button ref={submitRef} className="w-full">Create Student Account</Button>
          </div>
        )}

        {screen === "verify" && (
          <div className="text-center animate-in fade-in zoom-in-50 duration-300 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">@</div>
            <h3 className="text-2xl font-bold">Check your Gmail inbox</h3>
            <p className="text-sm text-muted-foreground">
              We sent a verification email to <span className="font-bold text-foreground">alex@uni.edu</span>.
            </p>
            <div className="border border-warning/30 bg-warning/15 p-4 rounded-xl text-sm text-warning-foreground">
              Can&apos;t find the email? Check your Spam folder.
            </div>
            <Button ref={verifyBtnRef} className="w-full">I verified, continue</Button>
          </div>
        )}

        {screen === "login" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold">Login to Pace</h3>
              <p className="text-sm text-muted-foreground">Enter your student credentials to continue.</p>
            </div>
            <Field label="Email">
              <Input ref={emailRef} type="email" placeholder="you@example.com" value={typing.email || ""} readOnly className={`${activeInput === "email" ? "ring-4 ring-primary/15 border-primary" : ""}`} />
            </Field>
            <Field label="Password">
              <Input ref={passRef} type="password" placeholder="At least 6 characters" value={typing.pass || ""} readOnly className={`${activeInput === "pass" ? "ring-4 ring-primary/15 border-primary" : ""}`} />
            </Field>
            <Button ref={submitRef} className="w-full">Login as Student</Button>
          </div>
        )}

        {screen === "success" && (
          <div className="text-center animate-in fade-in zoom-in-50 duration-300 space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-4xl font-bold text-success animate-pulse">✓</div>
            <h3 className="text-2xl font-bold">Login Successful!</h3>
            <p className="text-muted-foreground">Redirecting to Student Dashboard...</p>
          </div>
        )}
      </Card>
    </div>
  );
}