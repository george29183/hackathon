"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Textarea, Header } from "@/components/ui";

export default function CreateQuiz() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState("5");
  const [file, setFile] = useState(null);
  const [customPrompt, setCustomPrompt] = useState(""); // NEW
  const [timeLimit, setTimeLimit] = useState("5"); // Default 5 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleGenerate = async (e, isDemo = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // If it's the judges demo button, auto-fill the data
    const finalTitle = isDemo ? "Judges Demo Quiz" : title;
    const finalDiff = isDemo ? "medium" : difficulty;
    const finalNum = isDemo ? "5" : numQuestions;
    const finalPrompt = isDemo ? "Create a general knowledge quiz about famous scientists and physics." : customPrompt;


    if (!file && !finalPrompt) {
      setError("Please upload a PDF OR enter a custom prompt.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (file) formData.append("pdf", file);
      formData.append("difficulty", finalDiff);
      formData.append("title", finalTitle || "Untitled AI Quiz");
      formData.append("numQuestions", finalNum);
      formData.append("customPrompt", finalPrompt);
      formData.append("timeLimit", isDemo ? "5" : timeLimit);
      const response = await axios.post("/api/ai-quiz", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        router.push("/lecturer/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-mesh">
      <Header title="Create AI Quiz" onBack={() => router.push("/lecturer/dashboard")} />
      
      <section className="mx-auto max-w-2xl px-4 py-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">AI</div>
            <h1 className="text-2xl font-bold">AI Quiz Generator</h1>
            <p className="mt-2 text-sm text-muted-foreground">Upload a PDF OR enter a custom prompt to generate a quiz.</p>
          </div>

          {/* JUDGES DEMO BUTTON */}
          <Button 
            variant="secondary" 
            className="w-full mb-6" 
            onClick={(e) => handleGenerate(e, true)} 
            disabled={loading}
          >
            ⚡ Generate "Judges Demo" Quiz Instantly (No PDF needed)
          </Button>

          {error && <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          <form className="grid gap-5">
            <Field label="Quiz Title (Optional)">
              <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Introduction to Biology" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Difficulty Level">
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 w-full"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Field>

              <Field label="Number of Questions">
                <select 
                  value={numQuestions} 
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 w-full"
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                  <option value="20">20 Questions</option>
                </select>
              </Field>
              <Field label="Time Limit (Minutes)">
                <select 
                  value={timeLimit} 
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 w-full"
                >
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                </select>
              </Field>
            </div>

            <Field label="Custom Prompt (Optional - used if no PDF is uploaded)">
              <Textarea 
                value={customPrompt} 
                onChange={(e) => setCustomPrompt(e.target.value)} 
                placeholder="e.g. Create a quiz about the water cycle, focusing on evaporation and condensation." 
              />
            </Field>

            <Field label="Upload Lecture PDF (Optional)">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </Field>

            <Button type="submit" disabled={loading} onClick={(e) => handleGenerate(e)} className="mt-2">
              {loading ? "AI is generating quiz... (Wait 5-10 secs)" : "Generate Custom AI Quiz"}
            </Button>
          </form>
        </Card>
      </section>
    </main>
  );
}