"use client";

import React, { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TranscriptProvider } from '@/app/contexts/TranscriptContext';
import { EventProvider } from '@/app/contexts/EventContext';
import ConversationApp from './ConversationApp';

export default function ConversationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranscriptProvider>
        <EventProvider>
          <ConversationApp />
        </EventProvider>
      </TranscriptProvider>
    </Suspense>
  );
}

