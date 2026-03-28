// questions page - shows generated questions from pdf
// questions are divided into 2, 4, 6 marks

import React, { useEffect, useState } from 'react';
import { FileQuestion } from 'lucide-react';
import { useStudy } from '@/lib/studyContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState } from '@/components/LoadingState';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

// type for questions
interface QuestionsData {
  twoMarks: string[];
  fourMarks: string[];
  sixMarks: string[];
}

export default function Questions() {
  const { session } = useStudy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionsData | null>(null);

  useEffect(() => {
    // checking if session exists
    if (!session) {
      navigate('/');
      return;
    }

    // function to get questions from ai
    async function getQuestions() {
      console.log("generating questions...");
      try {
        let body = { pdfContent: session.pdfContent, type: 'questions' };
        const { data, error } = await supabase.functions.invoke('analyze-pdf', {
          body: body,
        });

        if (error) throw error;

        // setting questions data
        let result = data.result;
        if (result) {
          console.log("questions generated successfully");
          setQuestions(result);
        }
      } catch (err) {
        console.log('error getting questions:', err);
        toast.error('Failed to generate questions. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    getQuestions();
  }, [session, navigate]);

  if (!session) return null;

  // loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <PageHeader
            title="Important Questions"
            description="Generating exam-oriented questions..."
            icon={FileQuestion}
          />
          <LoadingState message="Generating important questions..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <PageHeader
          title="Important Questions"
          description="Exam-oriented questions from your study material"
          icon={FileQuestion}
        />

        {questions ? (
          <Tabs defaultValue="two" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
              <TabsTrigger value="two">2 Marks</TabsTrigger>
              <TabsTrigger value="four">4 Marks</TabsTrigger>
              <TabsTrigger value="six">6 Marks</TabsTrigger>
            </TabsList>

            <TabsContent value="two">
              <ShowQuestions 
                qList={questions.twoMarks} 
                m={2}
                desc="Short answer questions - answer in 2-3 sentences"
              />
            </TabsContent>

            <TabsContent value="four">
              <ShowQuestions 
                qList={questions.fourMarks} 
                m={4}
                desc="Medium answer questions - answer in a short paragraph"
              />
            </TabsContent>

            <TabsContent value="six">
              <ShowQuestions 
                qList={questions.sixMarks} 
                m={6}
                desc="Long answer questions - answer with detailed explanation"
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No questions generated. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// component to show list of questions
function ShowQuestions({ 
  qList, 
  m, 
  desc 
}: { 
  qList: string[]; 
  m: number;
  desc: string;
}) {
  return (
    <div>
      <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="space-y-4">
        {qList?.map((q, i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-card border border-border shadow-soft hover:shadow-medium transition-shadow"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-card-foreground leading-relaxed">{q}</p>
                <span className="inline-block mt-3 px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                  {m} marks
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
