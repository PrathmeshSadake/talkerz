"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

import { SessionStatus } from '@/app/types';
import { useTranscript } from '@/app/contexts/TranscriptContext';
import { useEvent } from '@/app/contexts/EventContext';
import { useRealtimeSession } from '@/app/hooks/useRealtimeSession';
import { RealtimeAgent } from '@openai/agents/realtime';

interface Passage {
  id: string;
  title: string;
  content: string;
  timeLimit: number;
  questions: Array<{
    id: string;
    questionText: string;
    recommendedAnswer: string;
    order: number;
  }>;
}

export default function ConversationApp() {
  const router = useRouter();
  const params = useParams();
  const passageId = params?.id as string;

  const [passage, setPassage] = useState<Passage | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('DISCONNECTED');
  const [conversationStartTime, setConversationStartTime] = useState<number>(0);
  const [conversationDuration, setConversationDuration] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullTranscript, setFullTranscript] = useState<Array<{role: string, content: string}>>([]);

  const { addTranscriptMessage, addTranscriptBreadcrumb, transcriptItems } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const sdkAudioElement = React.useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.createElement('audio');
    el.autoplay = true;
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }, []);

  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current) {
      audioElementRef.current = sdkAudioElement;
    }
  }, [sdkAudioElement]);

  const { connect, disconnect, sendEvent, interrupt } = useRealtimeSession({
    onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
  });

  useEffect(() => {
    // Load passage from sessionStorage
    const storedPassage = sessionStorage.getItem('currentPassage');
    if (storedPassage) {
      setPassage(JSON.parse(storedPassage));
    } else {
      // Fetch passage if not in sessionStorage
      fetchPassage();
    }
  }, [passageId]);

  useEffect(() => {
    if (passage && sessionStatus === 'DISCONNECTED') {
      connectToRealtime();
    }
  }, [passage]);

  useEffect(() => {
    // Track conversation duration
    if (sessionStatus === 'CONNECTED' && conversationStartTime === 0) {
      setConversationStartTime(Date.now());
    }

    if (sessionStatus === 'CONNECTED' && conversationStartTime > 0) {
      const timer = setInterval(() => {
        setConversationDuration(Math.floor((Date.now() - conversationStartTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionStatus, conversationStartTime]);

  useEffect(() => {
    // Build full transcript from transcript items
    if (transcriptItems && Array.isArray(transcriptItems)) {
      const transcript = transcriptItems
        .filter((item: any) => item.type === 'MESSAGE' && !item.isHidden)
        .map((item: any) => ({
          role: item.role,
          content: item.title || '',
        }));
      setFullTranscript(transcript);
    }
  }, [transcriptItems]);

  const fetchPassage = async () => {
    try {
      const response = await fetch(`/api/passages/${passageId}`);
      const data = await response.json();
      if (response.ok) {
        setPassage(data.passage);
      }
    } catch (err) {
      console.error('Error fetching passage:', err);
    }
  };

  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: '/session' }, 'fetch_session_token_request');
    const tokenResponse = await fetch('/api/session');
    const data = await tokenResponse.json();
    logServerEvent(data, 'fetch_session_token_response');

    if (!data.client_secret?.value) {
      logClientEvent(data, 'error.no_ephemeral_key');
      console.error('No ephemeral key provided by the server');
      setSessionStatus('DISCONNECTED');
      return null;
    }

    return data.client_secret.value;
  };

  const connectToRealtime = async () => {
    if (!passage || sessionStatus !== 'DISCONNECTED') return;
    
    setSessionStatus('CONNECTING');

    try {
      const EPHEMERAL_KEY = await fetchEphemeralKey();
      if (!EPHEMERAL_KEY) return;

      // Create context-enhanced agent with proper RealtimeAgent instance
      const baseInstructions = `You are a friendly and encouraging English speaking practice tutor. Your role is to help students improve their spoken English by discussing reading passages with them.

YOUR APPROACH:
1. Start with a warm greeting and ask the student how they found the passage
2. Ask questions about the passage to assess comprehension (use the provided questions if available)
3. Encourage the student to elaborate on their answers
4. Listen actively and provide positive reinforcement
5. Ask follow-up questions to keep the conversation flowing naturally
6. Speak clearly and at a moderate pace
7. Be patient and supportive - remember this is a practice session

CONVERSATION GUIDELINES:
- Keep questions conversational and natural
- Don't just read questions robotically - adapt them to the flow of conversation
- If the student struggles, rephrase your question or provide gentle hints
- Praise good responses and vocabulary usage
- Ask the student to explain their reasoning or provide examples
- Keep the conversation focused on the passage content
- Aim for a 5-7 minute conversation
- End gracefully by thanking the student and encouraging them

DO NOT:
- Interrupt the student while they're speaking
- Correct grammar during the conversation (this will be done in feedback later)
- Ask yes/no questions only - encourage elaboration
- Rush through questions`;

      const contextualInstructions = `${baseInstructions}

PASSAGE CONTEXT:
Title: "${passage.title}"
Content: ${passage.content}

QUESTIONS TO ASK (incorporate these naturally in conversation):
${passage.questions.map((q, i) => `${i + 1}. ${q.questionText}`).join('\n')}

Start by greeting the student warmly and asking them what they thought about the passage titled "${passage.title}". Then naturally guide the conversation through the questions above.`;

      const contextualAgent = new RealtimeAgent({
        name: 'englishSpeakingTutor',
        voice: 'alloy',
        instructions: contextualInstructions,
        handoffs: [],
        tools: [],
        handoffDescription: 'English speaking practice tutor that discusses reading passages with students',
      });

      await connect({
        getEphemeralKey: async () => EPHEMERAL_KEY,
        initialAgents: [contextualAgent],
        audioElement: sdkAudioElement,
        extraContext: {
          addTranscriptBreadcrumb,
          passage: passage,
        },
        outputGuardrails: [],
      });

      // Send initial greeting trigger
      setTimeout(() => {
        sendSimulatedUserMessage('hi');
      }, 1000);
    } catch (err) {
      console.error('Error connecting via SDK:', err);
      setSessionStatus('DISCONNECTED');
    }
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, 'user', text, true);

    sendEvent({
      type: 'conversation.item.create',
      item: {
        id,
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    });
    sendEvent({ type: 'response.create' });
  };

  const handleEndConversation = async () => {
    setIsProcessing(true);
    
    try {
      // Disconnect from realtime
      disconnect();
      setSessionStatus('DISCONNECTED');

      // Build transcript string
      const transcriptString = fullTranscript
        .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
        .join('\n\n');

      // Call grading API
      const gradeResponse = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptString,
          passageContent: passage?.content,
          questions: passage?.questions,
        }),
      });

      const gradeData = await gradeResponse.json();

      if (!gradeResponse.ok) {
        throw new Error(gradeData.error || 'Grading failed');
      }

      const evaluation = gradeData.evaluation;

      // Save session to database
      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_demo', // Replace with actual user ID when auth is implemented
          passageId: passage?.id,
          fullTranscript: transcriptString,
          duration: conversationDuration,
          comprehensionScore: evaluation.comprehensionScore,
          fluencyScore: evaluation.fluencyScore,
          lexicalScore: evaluation.lexicalScore,
          grammaticalScore: evaluation.grammaticalScore,
          pronunciationScore: evaluation.pronunciationScore,
          responsivenessScore: evaluation.responsivenessScore,
          overallScore: evaluation.overallScore,
          comprehensionFeedback: evaluation.comprehensionFeedback,
          fluencyFeedback: evaluation.fluencyFeedback,
          lexicalFeedback: evaluation.lexicalFeedback,
          grammaticalFeedback: evaluation.grammaticalFeedback,
          pronunciationFeedback: evaluation.pronunciationFeedback,
          responsivenessFeedback: evaluation.responsivenessFeedback,
          questionsAsked: passage?.questions.map(q => q.questionText).join('|||') || '',
          userAnswers: '', // Could extract from transcript if needed
          recommendedAnswers: passage?.questions.map(q => q.recommendedAnswer).join('|||') || '',
        }),
      });

      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok) {
        throw new Error(sessionData.error || 'Failed to save session');
      }

      // Navigate to results page
      router.push(`/speaking/results/${sessionData.session.id}`);
    } catch (error) {
      console.error('Error processing conversation:', error);
      alert('Failed to process conversation. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!passage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/openai-logomark.svg"
              alt="OpenAI Logo"
              width={32}
              height={32}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Speaking Practice: {passage.title}
              </h1>
              <p className="text-sm text-gray-600">
                Discuss the passage with your AI tutor
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-600">Duration</div>
              <div className="text-2xl font-mono font-bold text-blue-600">
                {formatTime(conversationDuration)}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              sessionStatus === 'CONNECTED'
                ? 'bg-green-100 text-green-800'
                : sessionStatus === 'CONNECTING'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {sessionStatus === 'CONNECTED' ? '🟢 Connected' : sessionStatus === 'CONNECTING' ? '🟡 Connecting...' : '⚪ Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Conversation Display */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {fullTranscript.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-pulse">
                <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
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
                </div>
                <p className="text-gray-600">Waiting for conversation to start...</p>
              </div>
            </div>
          ) : (
            fullTranscript.map((item, index) => (
              <div
                key={index}
                className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-lg px-6 py-4 ${
                    item.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 shadow-md'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-75">
                    {item.role === 'user' ? 'You' : 'AI Tutor'}
                  </div>
                  <div className="text-base leading-relaxed">{item.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="bg-white border-t shadow-lg px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>💡 Tip: Speak clearly and naturally. Take your time to think.</p>
          </div>
          <button
            onClick={handleEndConversation}
            disabled={isProcessing || sessionStatus !== 'CONNECTED' || conversationDuration < 30}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isProcessing || sessionStatus !== 'CONNECTED' || conversationDuration < 30
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : conversationDuration < 30 ? (
              'End Conversation (30s min)'
            ) : (
              'End Conversation & Get Feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

