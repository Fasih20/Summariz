'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { api } from '@/../convex/_generated/api';
import { useQuery } from 'convex/react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isSignedIn } = useUser(); 
  const router = useRouter();

  const lectures = useQuery(api.lecture.getLecturesByEmail, {
    email: user?.primaryEmailAddress?.emailAddress ?? '',
  });

  if (!isSignedIn) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <UserButton/>
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">🎓 Your Lectures</h1>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2 shadow-md transition">
            <Link href="/broadcast">+ New Lecture</Link>
          </Button>
        </div>

        {/* Lectures Grid */}
        {lectures?.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No lectures found. Start a new one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lectures?.map((lecture) => (
              <Card
                key={lecture._id}
                className="bg-gray-800 rounded-lg shadow hover:shadow-lg transition hover:scale-[1.01] border border-gray-700"
              >
                <CardContent className="p-5 space-y-4">
                  <CardTitle className="text-xl font-semibold text-white">📚 Lecture Summary</CardTitle>
                  <p className="text-sm text-gray-400">
                    {new Date(lecture.createdAt).toLocaleString()}
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                    onClick={() => router.push(`/view/${lecture._id}`)}
                  >
                    View Summary
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
