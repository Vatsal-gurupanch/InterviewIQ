"use client";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, BrainCircuit, LineChart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-indigo-600/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <BrainCircuit className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            InterviewIQ
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <SignInButton mode="modal">
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button className="bg-white text-black hover:bg-gray-200 transition-all rounded-full px-6 font-medium">
              Get Started
            </Button>
          </SignUpButton>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Powered by Gemini AI & NLP
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1]"
        >
          Master Your Next <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Tech Interview
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12 font-light leading-relaxed"
        >
          Practice with a personalized AI coach that evaluates your clarity, depth, and STAR method usage in real-time based on your own resume.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <SignUpButton mode="modal">
            <Button size="lg" className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-full group">
              Start Practicing Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </SignUpButton>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="grid md:grid-cols-3 gap-6 mt-32 w-full text-left"
        >
          {[
            {
              icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
              title: "Resume-Aware Q&A",
              desc: "Upload your PDF. The AI extracts your background to ask highly targeted behavioral and technical questions.",
            },
            {
              icon: <BrainCircuit className="w-8 h-8 text-indigo-400" />,
              title: "Deep NLP Evaluation",
              desc: "Get instant scores on sentiment, semantic similarity, and skill extraction using VADER and spaCy.",
            },
            {
              icon: <LineChart className="w-8 h-8 text-pink-400" />,
              title: "Progress Dashboard",
              desc: "Track your streaks, improvement across clarity/relevance/depth, and fill gaps in the STAR method.",
            },
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
              <div className="mb-6 bg-black/30 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
