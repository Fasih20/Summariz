'use client';

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gray-800 rounded-2xl shadow-2xl p-10 max-w-3xl w-full text-white space-y-8 text-center"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <Image
              src="/summarizicon.png" // replace with your own logo path
              alt="Summariz Logo"
              width={80}
              height={80}
            />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Welcome to <span className="text-purple-400">Summariz</span>
          </h1>
        </div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-300 max-w-xl mx-auto"
        >
          Modernize your classroom experience with <strong>live streaming</strong>, real-time <strong>transcription</strong>, and powerful <strong>AI summaries</strong> — all in one seamless platform.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
            <Button className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-lg px-6 py-3 rounded-xl shadow-lg">
              {isSignedIn ? "Go to Dashboard" : "Sign In"}
            </Button>
          </Link>
          {!isSignedIn && (
            <Link href="/sign-up">
              <Button
                variant="secondary"
                className="w-full sm:w-auto text-white bg-gray-700 hover:bg-gray-600 text-lg px-6 py-3 rounded-xl"
              >
                Sign Up
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Description / Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-sm text-gray-400"
        >
          <p><strong>Summariz</strong> is built for <span className="text-purple-300">educators</span> and <span className="text-purple-300">learners</span> alike. Whether you&apos;re streaming a live lecture or catching up later, everything is transcribed, summarized, and accessible — instantly.</p>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="pt-6 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Built with ❤️ using Next.js, Clerk, Convex, and OpenRouter
        </motion.div>
      </motion.div>
    </div>
  );
}
