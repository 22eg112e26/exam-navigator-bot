import React, { useEffect, useState } from 'react';
import { ClipboardCheck, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useStudy } from '@/lib/studyContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface MCQQuestion {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

interface MockTestData {
  questions: MCQQuestion[];
}

export default function MockTest() {
  const { session } = useStudy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    async function generateMockTest() {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-pdf', {
          body: { pdfContent: session.pdfContent, type: 'mockTest' },
        });

        if (error) throw error;

        if (data.result?.questions) {
          setQuestions(data.result.questions);
        }
      } catch (error) {
        console.error('Error generating mock test:', error);
        toast.error('Failed to generate mock test. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    generateMockTest();
  }, [session, navigate]);

  const handleAnswer = (questionId: number, answer: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitted(true);
    setShowResults(true);

    // Calculate results
    const correct = questions.filter(q => answers[q.id] === q.correct).length;
    const wrong = questions.length - correct;
    const accuracy = (correct / questions.length) * 100;

    // Save results
    try {
      await supabase.from('mock_test_results').insert({
        session_id: session?.id,
        total_questions: questions.length,
        correct_answers: correct,
        wrong_answers: wrong,
        accuracy: accuracy,
        answers: answers,
      });

      toast.success('Test submitted successfully!');
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <PageHeader
            title="Mock Test"
            description="Generating your test..."
            icon={ClipboardCheck}
          />
          <LoadingState message="Generating 20 MCQs..." />
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const difficultyColors = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning-foreground',
    hard: 'bg-destructive/10 text-destructive',
  };

  if (showResults) {
    const correct = questions.filter(q => answers[q.id] === q.correct).length;
    const accuracy = (correct / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <PageHeader
            title="Test Results"
            description="Review your answers"
            icon={ClipboardCheck}
          />

          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-6 rounded-xl bg-success/10 border border-success/20">
              <p className="text-sm text-success mb-1">Correct</p>
              <p className="text-3xl font-bold text-success">{correct}</p>
            </div>
            <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive mb-1">Wrong</p>
              <p className="text-3xl font-bold text-destructive">{questions.length - correct}</p>
            </div>
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary mb-1">Accuracy</p>
              <p className="text-3xl font-bold text-primary">{accuracy.toFixed(1)}%</p>
            </div>
          </div>

          {/* Questions review */}
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isCorrect = answers[q.id] === q.correct;
              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border ${
                    isCorrect 
                      ? 'bg-success/5 border-success/20' 
                      : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      isCorrect ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Q{idx + 1}. {q.question}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your answer: <span className="font-medium">{answers[q.id]}</span>
                        {!isCorrect && (
                          <> | Correct: <span className="font-medium text-success">{q.correct}</span></>
                        )}
                      </p>
                      {q.explanation && (
                        <p className="text-sm text-muted-foreground mt-2 p-3 rounded-lg bg-muted/50">
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <Button onClick={() => navigate('/performance')}>
              View Detailed Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <PageHeader
          title="Mock Test"
          description="20 Multiple Choice Questions"
          icon={ClipboardCheck}
        />

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${difficultyColors[currentQuestion.difficulty]}`}>
                {currentQuestion.difficulty}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-card-foreground mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
                const isSelected = answers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleAnswer(currentQuestion.id, key)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted/30 border-border hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <span className="font-medium">{key}.</span> {value}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question navigator */}
        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground mb-3">Jump to question:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isAnswered
                      ? 'bg-success/20 text-success'
                      : 'bg-background border border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
