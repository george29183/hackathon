"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button, Card, Field, Input, Header } from "@/components/ui";
import toast from "react-hot-toast";


export default function CreateManualQuiz() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([
    { questionText: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLimit, setTimeLimit] = useState("5"); // Default 5 minutes

  
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "" }]);
  };

    // NEW: Function to toggle question type
  const handleTypeChange = (qIndex, type) => {
    const newQuestions = [...questions];
    if (type === "tf") {
      newQuestions[qIndex].options = ["True", "False"];
      newQuestions[qIndex].correctAnswer = "";
    } else {
      newQuestions[qIndex].options = ["", "", "", ""];
      newQuestions[qIndex].correctAnswer = "";
    }
    newQuestions[qIndex].type = type;
    setQuestions(newQuestions);
  };


  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const quizData = { title, difficulty, timeLimit, category: "Manual", questions };
      await axios.post("/api/quiz", quizData, { withCredentials: true });
      toast.success("Quiz created successfully!");
      router.push("/lecturer/dashboard");
    } catch (err) {
      toast.error("Failed to create quiz. Make sure all fields are filled.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-mesh">
      <Header title="Create Manual Quiz" onBack={() => router.push("/lecturer/dashboard")} />
      
      <section className="mx-auto max-w-3xl px-4 py-8">
        {error && <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <Card className="p-6 mb-6">
          <Field label="Quiz Title">
            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. History Chapter 1" />
          </Field>
          <div className="mt-4">
            <Field label="Difficulty">
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
        </Card>

       {questions.map((q, qIndex) => (
          <Card key={qIndex} className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Question {qIndex + 1}</h3>
              {/* NEW: Type Selector */}
              <select 
                value={q.type} 
                onChange={(e) => handleTypeChange(qIndex, e.target.value)}
                className="h-9 rounded-lg border border-input bg-card px-3 text-xs outline-none focus:border-primary"
              >
                <option value="mcq">Multiple Choice (4)</option>
                <option value="tf">True / False</option>
              </select>
            </div>
            
            <Field label="Question Text">
              <Input 
                type="text" 
                value={q.questionText} 
                onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)} 
                placeholder="Type your question here" 
              />
            </Field>
            
            <div className="mt-4 space-y-3">
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name={`correct-${qIndex}`} 
                    checked={q.correctAnswer === opt} 
                    onChange={() => handleQuestionChange(qIndex, "correctAnswer", opt)} 
                    className="h-4 w-4 text-primary focus:ring-primary"
                    disabled={q.type === "tf" && opt !== "True" && opt !== "False"} // Just in case
                  />
                  <Input 
                    type="text" 
                    placeholder={`Option ${optIndex + 1}`} 
                    value={opt} 
                    onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)} 
                    disabled={q.type === "tf"} // Lock inputs for True/False
                    className={q.type === "tf" ? "bg-muted cursor-not-allowed" : ""}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}

        <Button variant="outline" onClick={addQuestion} className="w-full mb-4">
          + Add Another Question
        </Button>

        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Save Quiz"}
        </Button>
      </section>
    </main>
  );
}