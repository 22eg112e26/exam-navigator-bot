// context for storing study session data
// this is used across the app to share pdf info

import React, { createContext, useContext, useState, ReactNode } from 'react';

// session type - stores pdf details
interface StudySession {
  id: string;
  pdfName: string;
  pdfUrl: string;
  pdfContent: string;
}

// context type
interface StudyContextType {
  session: StudySession | null;
  setSession: (session: StudySession | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

// provider component
export function StudyProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // simple context value
  let val = { session, setSession, isLoading, setIsLoading };

  return (
    <StudyContext.Provider value={val}>
      {children}
    </StudyContext.Provider>
  );
}

// custom hook to use study context
export function useStudy() {
  const ctx = useContext(StudyContext);
  if (ctx === undefined) {
    console.log("useStudy called outside provider!!");
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return ctx;
}
