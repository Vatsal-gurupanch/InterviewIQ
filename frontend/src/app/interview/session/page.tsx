"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Mic, Square, Send, BrainCircuit, CheckCircle, AlertTriangle, ArrowRight, Trophy } from "lucide-react";
import { Suspense, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useAuth } from "@clerk/nextjs";

function SessionContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const { getToken } = useAuth();
  
  const [recording, setRecording] = useState(false);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [question, setQuestion] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [sessionReport, setSessionReport] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(100);
  const router = useRouter();

  const recognitionRef = useRef<any>(null);

  // Load initial question from session storage ONCE on mount
  useEffect(() => {
    if (sessionId) {
      const q = sessionStorage.getItem(`session_q_${sessionId}`);
      if (q) setQuestion(q);
    }

    // Setup Speech Recognition once
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setAnswer(() => currentTranscript);
        };
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [sessionId]); // Only run once when sessionId is available

  // Separate effect for the timer — depends on state changes
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        if (isEvaluating || isComplete || feedback) return prev; // pause timer
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isEvaluating, isComplete, feedback]);

  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
    } else {
      setAnswer("");
      recognitionRef.current?.start();
      setRecording(true);
    }
  };

  const handleEvaluate = async () => {
    if (!answer || !sessionId) return;
    setIsEvaluating(true);
    if (recording) toggleRecording(); // stop recording
    
    try {
      const token = await getToken();
      const res = await fetch("http://127.0.0.1:8000/api/interviews/evaluate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ session_id: sessionId, user_answer: answer }),
      });
      const data = await res.json();
      
      setFeedback(data);
      if (data.is_complete) {
        setIsComplete(true);
        setSessionReport(data.session);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (feedback?.next_question) {
      setQuestion(feedback.next_question);
      setQuestionIndex(prev => prev + 1);
      setAnswer("");
      setFeedback(null);
      setTimeLeft(100);
    }
  };

  if (isComplete && sessionReport) {
    const avgScore = sessionReport.scores?.length > 0 
      ? (sessionReport.scores.reduce((a:number, b:number) => a + b, 0) / sessionReport.scores.length).toFixed(1)
      : "0.0";
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6">
        <div className="absolute top-0 w-1/2 h-1/2 bg-emerald-600/20 blur-[150px] rounded-full pointer-events-none" />
        <Card className="max-w-2xl w-full bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl relative z-10">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <CardTitle className="text-4xl font-bold">Interview Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="text-gray-300 text-lg">You have successfully completed 5 questions.</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Average Score</div>
                <div className="text-5xl font-extrabold text-emerald-400">{avgScore}</div>
              </div>
              <div className="bg-black/50 p-6 rounded-2xl border border-white/5">
                <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">Target Role</div>
                <div className="text-xl font-medium text-indigo-300 mt-2">{sessionReport.role}</div>
              </div>
            </div>
            <Button className="mt-8 bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-full" onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <BrainCircuit className="text-indigo-400 w-6 h-6" />
          <span className="font-bold">Active Session</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`text-sm font-bold px-3 py-1 rounded-full ${timeLeft <= 10 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 text-gray-300'}`}>
            01:{timeLeft.toString().padStart(2, '0')}
          </div>
          <div className="text-sm font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-full">
            Question {questionIndex} of 5
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Question & Input */}
        <div className="flex flex-col h-full space-y-6">
          <Card className="bg-white/5 border-white/10 text-white shadow-xl shadow-black/50">
            <CardHeader>
              <div className="text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-2">Question {questionIndex}</div>
              <CardTitle className="text-2xl leading-relaxed">{question || "Loading..."}</CardTitle>
            </CardHeader>
          </Card>

          <div className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col relative min-h-[300px]">
            <textarea 
              className="flex-1 w-full bg-transparent resize-none outline-none text-lg text-gray-200 placeholder:text-gray-600"
              placeholder="Speak or type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isEvaluating || !!feedback}
            />
            
            {!feedback && (
              <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4">
                <Button 
                  variant={recording ? "destructive" : "secondary"}
                  size="icon"
                  className={`rounded-full h-12 w-12 ${recording ? 'animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  onClick={toggleRecording}
                  title="Toggle Speech-to-Text"
                >
                  {recording ? <Square className="fill-current w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-full font-medium"
                  onClick={handleEvaluate}
                  disabled={!answer || isEvaluating}
                >
                  {isEvaluating ? "Evaluating..." : "Submit Answer"}
                  {!isEvaluating && <Send className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Feedback Dashboard */}
        <div className="h-full">
          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-white/10 rounded-3xl"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <BrainCircuit className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-300 mb-2">Awaiting Your Answer</h3>
                <p className="text-gray-500">Your real-time NLP analysis and Gemini evaluation will appear here.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Evaluation</h2>
                  <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-500/30">
                    Overall: {feedback?.evaluation?.overall || 0}/10
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Clarity", val: feedback?.evaluation?.scores?.clarity || 0, color: "bg-blue-500" },
                    { label: "Relevance", val: feedback?.evaluation?.scores?.relevance || 0, color: "bg-emerald-500" },
                    { label: "Depth", val: feedback?.evaluation?.scores?.depth || 0, color: "bg-purple-500" },
                  ].map((s, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 text-white">
                      <CardContent className="p-4 text-center">
                        <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">{s.label}</div>
                        <div className="text-2xl font-bold mb-2">{s.val}</div>
                        <Progress value={s.val * 10} className={`h-1.5 bg-white/10 ${s.color}`} />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Tabs defaultValue="insights" className="w-full">
                  <TabsList className="w-full bg-white/5 border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="insights" className="w-1/2 rounded-lg data-[state=active]:bg-indigo-600">AI Insights</TabsTrigger>
                    <TabsTrigger value="nlp" className="w-1/2 rounded-lg data-[state=active]:bg-indigo-600">NLP Metrics</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="insights" className="mt-4 space-y-4">
                    <Card className="bg-white/5 border-emerald-500/30 text-white">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                        <CardTitle className="text-lg">Strengths</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-gray-300 text-sm">
                        <ul className="list-disc pl-5 space-y-1">
                          {(feedback?.evaluation?.strengths || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-pink-500/30 text-white">
                      <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-pink-400" />
                        <CardTitle className="text-lg">Improvements</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-gray-300 text-sm">
                        <ul className="list-disc pl-5 space-y-1">
                          {(feedback?.evaluation?.improvements || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="nlp" className="mt-4 space-y-4">
                    <Card className="bg-white/5 border-white/10 text-white">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Vocal Confidence</span>
                          <span className="text-sm font-medium px-2 py-1 bg-white/10 rounded uppercase">{feedback.nlp_metrics?.confidence?.label || 'N/A'}</span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-400">STAR Method Completion</span>
                            <span className="text-sm font-medium">{feedback.nlp_metrics?.star?.score || 0}/4</span>
                          </div>
                          <div className="flex gap-1">
                            {['situation', 'task', 'action', 'result'].map(k => (
                              <div key={k} className={`flex-1 h-2 rounded-full ${feedback.nlp_metrics?.star?.hits?.[k] ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="pt-4 flex justify-end">
                  <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6" onClick={nextQuestion}>
                    {questionIndex < 5 ? "Next Question" : "Finish Interview"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function InterviewSession() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">Loading Session...</div>}>
      <SessionContent />
    </Suspense>
  );
}
