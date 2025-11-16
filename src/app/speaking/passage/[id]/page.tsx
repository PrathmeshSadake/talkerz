"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

interface Question {
  id: string;
  questionText: string;
  recommendedAnswer: string;
  order: number;
}

interface Passage {
  id: string;
  title: string;
  content: string;
  timeLimit: number;
  questions: Question[];
}

export default function PassageDetailPage() {
  const router = useRouter();
  const params = useParams();
  const passageId = params?.id as string;

  const [passage, setPassage] = useState<Passage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingComplete, setReadingComplete] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (passageId) {
      fetchPassage();
    }
  }, [passageId]);

  useEffect(() => {
    // Track reading time
    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchPassage = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/passages/${passageId}`);
      const data = await response.json();

      if (response.ok) {
        setPassage(data.passage);
      } else {
        setError(data.error || 'Failed to fetch passage');
      }
    } catch (err) {
      setError('Failed to load passage');
      console.error('Error fetching passage:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    // Store passage data in sessionStorage for the conversation page
    if (passage) {
      sessionStorage.setItem('currentPassage', JSON.stringify(passage));
      router.push(`/speaking/conversation/${passageId}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !passage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error || 'Passage not found'}</p>
          <button
            onClick={() => router.push('/speaking')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/speaking')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>
            <div className="flex items-center space-x-2 text-gray-600">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-mono">{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Passage Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center space-x-3 mb-2">
              <Image
                src="/openai-logomark.svg"
                alt="OpenAI Logo"
                width={24}
                height={24}
                className="brightness-0 invert"
              />
              <span className="text-white text-sm font-medium">
                Reading Passage
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {passage.title}
            </h1>
            <p className="text-blue-100 text-sm">
              Suggested time: {passage.timeLimit} minutes
            </p>
          </div>

          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {passage.content}
              </div>
            </div>
          </div>
        </div>

        {/* Questions Preview */}
        {passage.questions && passage.questions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Discussion Topics
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
              During the conversation, you'll be asked questions like these:
            </p>
            <ul className="space-y-3">
              {passage.questions.slice(0, 3).map((question, index) => (
                <li key={question.id} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{question.questionText}</span>
                </li>
              ))}
              {passage.questions.length > 3 && (
                <li className="text-gray-500 text-sm italic ml-9">
                  + {passage.questions.length - 3} more questions
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Completion Checkbox */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={readingComplete}
              onChange={(e) => setReadingComplete(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-3 text-gray-800 group-hover:text-gray-900 font-medium">
              I have finished reading the passage and I'm ready to practice speaking
            </span>
          </label>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStartPractice}
            disabled={!readingComplete}
            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform ${
              readingComplete
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {readingComplete ? (
              <span className="flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                Start Speaking Practice
              </span>
            ) : (
              'Complete the checkbox above to continue'
            )}
          </button>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Tips for Success
          </h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Find a quiet place where you can speak clearly</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Make sure your microphone is working properly</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Speak naturally and take your time to think</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Don't worry about making mistakes - this is practice!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

