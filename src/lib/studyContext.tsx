import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StudySession {
  id: string;
  pdfName: string;
  pdfUrl: string;
  pdfContent: string;
}

interface StudyContextType {
  session: StudySession | null;
  setSession: (session: StudySession | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <StudyContext.Provider value={{ session, setSession, isLoading, setIsLoading }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}
