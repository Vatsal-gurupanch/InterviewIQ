"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, PlayCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@clerk/nextjs";

export default function InterviewSetup() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [role, setRole] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/interviews/upload-resume", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.text) {
        setResumeText(data.text);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const startSession = async () => {
    if (!role || !mode) return;
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("http://127.0.0.1:8000/api/interviews/start", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role, mode, resume_text: resumeText }),
      });
      const data = await res.json();
      if (data.session_id) {
        // Redirect to the session with the question pre-loaded
        sessionStorage.setItem(`session_q_${data.session_id}`, data.question);
        router.push(`/interview/session?id=${data.session_id}`);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />
      
      <Card className="w-full max-w-lg bg-white/5 border-white/10 text-white backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
            <PlayCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Configure Session</CardTitle>
          <CardDescription className="text-gray-400">Tailor the AI to your specific interview needs</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="role">Target Role</Label>
            <Input 
              id="role" 
              placeholder="e.g. Senior Frontend Engineer" 
              className="bg-black/50 border-white/10 text-white placeholder:text-gray-600 h-12"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Interview Mode</Label>
            <Select onValueChange={(val: any) => setMode(val)}>
              <SelectTrigger className="bg-black/50 border-white/10 text-white h-12">
                <SelectValue placeholder="Select type of questions" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10 text-white">
                <SelectItem value="behavioral">Behavioral (STAR Method focus)</SelectItem>
                <SelectItem value="technical">Technical (Skill depth focus)</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 pt-2">
            <Label>Upload Resume (Optional)</Label>
            <input 
              type="file" 
              accept=".pdf" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <div 
              className={`border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${resumeText ? 'bg-emerald-500/10 border-emerald-500/30' : 'hover:bg-white/5'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className={`w-8 h-8 mb-3 transition-colors ${resumeText ? 'text-emerald-400' : 'text-gray-500 group-hover:text-indigo-400'}`} />
              <div className="text-sm font-medium mb-1">
                {uploading ? "Analyzing Resume..." : resumeText ? "Resume Analyzed Successfully!" : "Click to upload PDF"}
              </div>
              <div className="text-xs text-gray-500">
                {resumeText ? "Context will be used to generate personalized questions." : "The AI will use this to ask contextual questions"}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-lg rounded-xl"
            onClick={startSession}
            disabled={!role || !mode || loading}
          >
            {loading ? "Preparing Agent..." : "Start Interview"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
