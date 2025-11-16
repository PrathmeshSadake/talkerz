"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Passage {
  id: string;
  title: string;
  content: string;
  timeLimit: number;
  createdAt: string;
  _count?: {
    topic_interviews: number;
  };
}

export default function SpeakingHomePage() {
  const router = useRouter();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPassages();
  }, []);

  const fetchPassages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/passages");
      const data = await response.json();

      if (response.ok) {
        setPassages(data.passages);
      } else {
        setError(data.error || "Failed to fetch passages");
      }
    } catch (err) {
      setError("Failed to load passages");
      console.error("Error fetching passages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePassageClick = (passageId: string) => {
    router.push(`/speaking/passage/${passageId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
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
                <h1 className="text-3xl font-bold text-gray-900">Talkerz</h1>
                <p className="text-gray-600 mt-1">
                  Talkerz is a platform for practicing English speaking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Select a Passage
                </h3>
                <p className="text-gray-600 text-sm">
                  Choose a reading passage from the list below
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Read & Practice
                </h3>
                <p className="text-gray-600 text-sm">
                  Read the passage, then speak with our AI tutor
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Get Feedback
                </h3>
                <p className="text-gray-600 text-sm">
                  Receive detailed evaluation and improve your skills
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Passages List */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Select a Reading Passage
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchPassages}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : passages.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <p className="text-yellow-800 text-lg">
                No passages available yet. Please add some passages to get
                started.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {passages.map((passage) => (
                <div
                  key={passage.id}
                  onClick={() => handlePassageClick(passage.id)}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden group"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {passage.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {passage.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
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
                        {passage.timeLimit} min
                      </span>
                      {passage._count && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {passage._count.topic_interviews} attempts
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-blue-50 px-6 py-3 group-hover:bg-blue-100 transition-colors">
                    <span className="text-blue-600 font-medium text-sm">
                      Start Practice →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
