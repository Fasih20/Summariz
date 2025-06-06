'use client';

import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

const page = () => {
  return (
    <div className="relative min-h-screen bg-[url('/backg.png')] bg-cover bg-center flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      {/* Centered Sign-In Card */}
      <div className="relative z-10 w-full max-w-md p-8 bg-gray-800 bg-opacity-80 rounded-2xl shadow-xl backdrop-blur-md border border-gray-700">
        {/* Branding */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/summarizicon.png" // Update if you use a different path
            width={60}
            height={60}
            alt="Summariz logo"
          />
          <h2 className="text-2xl font-semibold text-white mt-2">Welcome to <span className="text-purple-400">Summariz</span></h2>
          <p className="text-gray-400 text-sm">Sign up to continue</p>
        </div>

        <SignUp
          path="/sign-in"
          routing="path"
          afterSignInUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#8B5CF6", // Tailwind purple-500
              colorText: "#000000",
              fontFamily: "Inter, sans-serif",
            },
            elements: {
              card: "shadow-none bg-transparent text-white",
              formButtonPrimary:
                "bg-purple-600 hover:bg-purple-700 text-white rounded-md py-2 px-4 mt-4",
              input:
                "bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-md",
              headerTitle: "text-white text-lg font-semibold",
              headerSubtitle: "text-gray-400 text-sm",
              footerActionText: "text-gray-400",
              footerActionLink: "text-purple-400 hover:underline",
            },
          }}
        />
      </div>
    </div>
  );
};

export default page;
