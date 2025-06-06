'use client';

import { useQuery } from 'convex/react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookText, Calendar } from 'lucide-react';

export default function ViewLecturePage() {
  const router = useRouter();
  const params = useParams<{ id: Id<'lectures'> }>();
  const { id } = params;

  // Fetch the specific lecture by its ID
  const lecture = useQuery(api.lecture.getLectureById, {
    id: id,
  });

  // Show a loading state while fetching data
  if (lecture === undefined) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <p className="text-white text-lg">Loading lecture...</p>
      </div>
    );
  }

  // Show a not found message if the lecture doesn't exist
  if (lecture === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
        <h1 className="text-2xl font-bold mb-4">Lecture Not Found</h1>
        <Button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-white hover:bg-gray-800"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Lecture Summary Card */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white flex items-center">
              <BookText className="mr-3 h-8 w-8 text-purple-400" />
              Lecture Summary
            </CardTitle>
            <CardDescription className="text-gray-400 pt-2 flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Created on {new Date(lecture.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-lg max-w-none text-gray-300 whitespace-pre-wrap">
              {lecture.summary}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}