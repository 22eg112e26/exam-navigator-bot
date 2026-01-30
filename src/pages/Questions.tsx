import React, { useEffect, useState } from 'react';
import { FileQuestion } from 'lucide-react';
import { useStudy } from '@/lib/studyContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState } from '@/components/LoadingState';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

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
    if (!session) {
      navigate('/');
      return;
    }

    async function generateQuestions() {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-pdf', {
          body: { pdfContent: session.pdfContent, type: 'questions' },
        });

        if (error) throw error;

        if (data.result) {
          setQuestions(data.result);
        }
      } catch (error) {
        console.error('Error generating questions:', error);
        toast.error('Failed to generate questions. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    generateQuestions();
  }, [session, navigate]);

  if (!session) return null;

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
              <QuestionList 
                questions={questions.twoMarks} 
                marks={2}
                description="Short answer questions - answer in 2-3 sentences"
              />
            </TabsContent>

            <TabsContent value="four">
              <QuestionList 
                questions={questions.fourMarks} 
                marks={4}
                description="Medium answer questions - answer in a short paragraph"
              />
            </TabsContent>

            <TabsContent value="six">
              <QuestionList 
                questions={questions.sixMarks} 
                marks={6}
                description="Long answer questions - answer with detailed explanation"
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

function QuestionList({ 
  questions, 
  marks, 
  description 
}: { 
  questions: string[]; 
  marks: number;
  description: string;
}) {
  return (
    <div>
      <div className="mb-6 p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">
        {questions?.map((question, index) => (
          <div
            key={index}
            className="p-5 rounded-xl bg-card border border-border shadow-soft hover:shadow-medium transition-shadow"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-card-foreground leading-relaxed">{question}</p>
                <span className="inline-block mt-3 px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                  {marks} marks
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
