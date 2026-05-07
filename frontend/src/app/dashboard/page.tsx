"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, LineChart, Target, Zap, Play, Trophy } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navbar */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <BrainCircuit className="text-white w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">InterviewIQ</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Welcome back, {user?.firstName}</span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Track your interview preparation progress.</p>
          </div>
          <Link href="/interview">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-12">
              <Play className="w-4 h-4 mr-2 fill-current" />
              New Interview Session
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Current Streak", value: "3 Days", icon: <Zap className="w-5 h-5 text-yellow-500" /> },
            { label: "Sessions Completed", value: "12", icon: <Target className="w-5 h-5 text-indigo-400" /> },
            { label: "Avg. Clarity Score", value: "8.2/10", icon: <LineChart className="w-5 h-5 text-emerald-400" /> },
            { label: "Leaderboard Rank", value: "#42", icon: <Trophy className="w-5 h-5 text-pink-400" /> },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-white/5 border-white/10 text-white shadow-xl shadow-black/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 font-medium text-sm">{stat.label}</span>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Deep Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-2 bg-white/5 border-white/10 text-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Skill Gap Report</CardTitle>
              <CardDescription className="text-gray-400">Keywords mentioned vs Target Role (Software Engineer)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { skill: "React", progress: 90, color: "bg-blue-500" },
                { skill: "System Design", progress: 45, color: "bg-orange-500" },
                { skill: "Data Structures", progress: 75, color: "bg-emerald-500" },
                { skill: "Leadership (STAR)", progress: 30, color: "bg-pink-500" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{s.skill}</span>
                    <span className="text-gray-400">{s.progress}% Coverage</span>
                  </div>
                  <Progress value={s.progress} className={`h-2 bg-white/10 ${s.color}`} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription className="text-gray-400">Your latest practice history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { role: "Frontend Dev", date: "Today", score: "8.5" },
                  { role: "Full Stack", date: "Yesterday", score: "7.2" },
                  { role: "Behavioral", date: "3 days ago", score: "9.0" },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <div className="font-medium text-sm">{session.role}</div>
                      <div className="text-xs text-gray-400">{session.date}</div>
                    </div>
                    <div className="text-indigo-400 font-bold">{session.score}</div>
                  </div>
                ))}
              </div>
              <Button variant="link" className="w-full mt-4 text-indigo-400">View All History</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
