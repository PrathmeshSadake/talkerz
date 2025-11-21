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

      if (response.ok) setPassages(data.passages);
      else setError(data.error || "Failed to fetch passages");
    } catch (err) {
      setError("Failed to load passages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePassageClick = (id: string) => {
    router.push(`/speaking/passage/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/openai-logomark.svg"
              alt="OpenAI"
              width={42}
              height={42}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Talkerz
              </h1>
              <p className="text-gray-600 text-sm">
                Your AI-powered English speaking practice.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* How it works */}
        <section className="bg-white rounded-2xl shadow-lg p-10 mb-12 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: 1,
                title: "Select a Passage",
                desc: "Choose a reading passage from the list below.",
              },
              {
                step: 2,
                title: "Read & Practice",
                desc: "Read the passage and speak with our AI tutor.",
              },
              {
                step: 3,
                title: "Get Feedback",
                desc: "Receive evaluation and improve your speaking.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Passages */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Select a Reading Passage
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchPassages}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : passages.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
              <p className="text-yellow-800 text-lg">
                No passages available yet. Please add some to begin.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {passages.map((passage) => (
                <div
                  key={passage.id}
                  onClick={() => handlePassageClick(passage.id)}
                  className="group bg-white rounded-2xl shadow hover:shadow-2xl cursor-pointer border border-gray-100 transition-all overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition">
                      {passage.title}
                    </h3>

                    <p className="text-gray-600 text-sm mt-3 line-clamp-3">
                      {passage.content}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mt-6">
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
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded-md">
                          {passage._count.topic_interviews} attempts
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 group-hover:bg-blue-100 px-6 py-3 text-blue-600 font-medium text-sm transition">
                    Start Practice →
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
