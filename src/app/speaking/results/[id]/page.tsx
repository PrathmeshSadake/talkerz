"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

interface Session {
  id: string;
  userId: string;
  passageId: string;
  fullTranscript: string;
  duration: number;
  comprehensionScore: number | null;
  fluencyScore: number | null;
  lexicalScore: number | null;
  grammaticalScore: number | null;
  pronunciationScore: number | null;
  responsivenessScore: number | null;
  overallScore: number | null;
  comprehensionFeedback: string | null;
  fluencyFeedback: string | null;
  lexicalFeedback: string | null;
  grammaticalFeedback: string | null;
  pronunciationFeedback: string | null;
  responsivenessFeedback: string | null;
  createdAt: string;
  passages: {
    id: string;
    title: string;
    content: string;
  };
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        setSession(data.session);
      } else {
        setError(data.error || 'Failed to fetch session');
      }
    } catch (err) {
      setError('Failed to load results');
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'gray';
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return 'N/A';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const ScoreCard = ({
    title,
    score,
    feedback,
    icon,
  }: {
    title: string;
    score: number | null;
    feedback: string | null;
    icon: React.ReactNode;
  }) => {
    const color = getScoreColor(score);
    const label = getScoreLabel(score);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
              {icon}
            </div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold text-${color}-600`}>
              {score !== null ? score : '-'}
            </div>
            <div className={`text-xs font-medium text-${color}-600`}>
              {label}
            </div>
          </div>
        </div>
        {feedback && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{feedback}</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error || 'Session not found'}</p>
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
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/openai-logomark.svg"
                alt="OpenAI Logo"
                width={40}
                height={40}
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Your Results
                </h1>
                <p className="text-gray-600 mt-1">
                  {session.passages.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/speaking')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Practice Again
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Overall Performance</h2>
              <p className="text-blue-100">
                Duration: {formatDuration(session.duration)} • Completed on{' '}
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">
                {session.overallScore !== null ? session.overallScore : '-'}
              </div>
              <div className="text-xl font-medium text-blue-100">
                {getScoreLabel(session.overallScore)}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Detailed Evaluation
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScoreCard
              title="Comprehension"
              score={session.comprehensionScore}
              feedback={session.comprehensionFeedback}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <ScoreCard
              title="Fluency"
              score={session.fluencyScore}
              feedback={session.fluencyFeedback}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              }
            />
            <ScoreCard
              title="Vocabulary"
              score={session.lexicalScore}
              feedback={session.lexicalFeedback}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              }
            />
            <ScoreCard
              title="Grammar"
              score={session.grammaticalScore}
              feedback={session.grammaticalFeedback}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />
            <ScoreCard
              title="Pronunciation"
              score={session.pronunciationScore}
              feedback={session.pronunciationFeedback}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              }
            />
            <ScoreCard
              title="Responsiveness"
              score={session.responsivenessScore}
              feedback={session.responsivenessFeedback}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              }
            />
          </div>
        </div>

        {/* Transcript Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                View Full Transcript
              </h3>
            </div>
            <svg
              className={`w-6 h-6 text-gray-400 transition-transform ${
                showTranscript ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTranscript && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans">
                {session.fullTranscript}
              </pre>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => router.push(`/speaking/passage/${session.passageId}`)}
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Practice This Passage Again
          </button>
          <button
            onClick={() => router.push('/speaking')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Different Passage
          </button>
        </div>
      </div>
    </div>
  );
}

