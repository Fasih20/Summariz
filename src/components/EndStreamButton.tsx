import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import axios from "axios";

export function EndStreamButton({ transcription }: { transcription: string }) {
  const router = useRouter();
  const { user } = useUser();
  const createLecture = useMutation(api.lecture.createLecture);

  const handleEndStream = async () => {
    try {
      // Generate a summary from the transcription (similar to your Transcript component)
      const summary = await generateSummary(transcription);
      
      await createLecture({
        email: user?.primaryEmailAddress?.emailAddress || "unknown@example.com",
        summary: summary,
        createdAt: Date.now(),
      });
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to end stream:", error);
      // You might want to add toast notification here
    }
  };

  // Helper function to generate summary (similar to your existing code)
  const generateSummary = async (text: string) => {
    if (!text.trim()) return "";
    
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'qwen/qwen3-0.6b-04-28:free',
          messages: [{
            role: 'user',
            content: `Summarize the following lecture in clear, concise bullet points:\n\n${text}`
          }],
          temperature: 0.3,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      return response.data?.choices?.[0]?.message?.content || "No summary generated";
    } catch (error) {
      console.error('Summary generation failed:', error);
      return "Failed to generate summary";
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleEndStream}
      className="flex items-center gap-2"
    >
      <span>End Stream</span>
    </Button>
  );
}