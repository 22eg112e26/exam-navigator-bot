// mock test page
// shows 20 mcq questions one by one
// user can navigate between questions

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

// question type
interface MCQQuestion {
  id: number;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

export default function MockTest() {
  const { session } = useStudy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    // getting mock test from ai
    async function getMockTest() {
      console.log("generating mock test...");
      try {
        let reqBody = { pdfContent: session.pdfContent, type: 'mockTest' };
        const { data, error } = await supabase.functions.invoke('analyze-pdf', {
          body: reqBody,
        });

        if (error) throw error;

        let result = data.result;
        if (result?.questions) {
          console.log("got", result.questions.length, "questions");
          setQuestions(result.questions);
        }
      } catch (err) {
        console.log('error generating mock test:', err);
        toast.error('Failed to generate mock test. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    getMockTest();
  }, [session, navigate]);

  // handle selecting an answer
  function handleAnswer(qId: number, ans: string) {
    if (submitted) return;
    console.log("answered question", qId, "with", ans);
    setAnswers(prev => ({ ...prev, [qId]: ans }));
  }

  // submit the test
  async function handleSubmit() {
    // checking if all answered
    let totalAnswered = Object.keys(answers).length;
    if (totalAnswered < questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitted(true);
    setShowResults(true);

    // calculating results
    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
      let q = questions[i];
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    }
    let wrongCount = questions.length - correctCount;
    let acc = (correctCount / questions.length) * 100;
    
    console.log("results - correct:", correctCount, "wrong:", wrongCount, "accuracy:", acc);

    // saving to database
    try {
      await supabase.from('mock_test_results').insert({
        session_id: session?.id,
        total_questions: questions.length,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        accuracy: acc,
        answers: answers,
      });

      toast.success('Test submitted successfully!');
    } catch (err) {
      console.log('error saving results:', err);
    }
  }

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

  // current question
  let currQ = questions[currentIdx];
  let progressVal = ((currentIdx + 1) / questions.length) * 100;

  // difficulty colors
  let diffColors: Record<string, string> = {
    easy: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning-foreground',
    hard: 'bg-destructive/10 text-destructive',
  };

  // show results page
  if (showResults) {
    let correct = questions.filter(q => answers[q.id] === q.correct).length;
    let accuracy = (correct / questions.length) * 100;

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <PageHeader
            title="Test Results"
            description="Review your answers"
            icon={ClipboardCheck}
          />

          {/* summary cards */}
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

          {/* all questions review */}
          <div className="space-y-4">
            {questions.map((q, idx) => {
              let isRight = answers[q.id] === q.correct;
              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border ${
                    isRight 
                      ? 'bg-success/5 border-success/20' 
                      : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      isRight ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {isRight ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">Q{idx + 1}. {q.question}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your answer: <span className="font-medium">{answers[q.id]}</span>
                        {!isRight && (
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

        {/* progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>{Object.keys(answers).length} answered</span>
          </div>
          <Progress value={progressVal} className="h-2" />
        </div>

        {/* question display */}
        {currQ && (
          <div className="p-6 rounded-2xl bg-card border border-border shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${diffColors[currQ.difficulty]}`}>
                {currQ.difficulty}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-card-foreground mb-6">
              {currQ.question}
            </h3>

            <div className="space-y-3">
              {Object.entries(currQ.options).map(([key, value]) => {
                let selected = answers[currQ.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleAnswer(currQ.id, key)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      selected
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

        {/* navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentIdx === questions.length - 1 ? (
            <Button onClick={handleSubmit}>
              Submit Test
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* question navigator grid */}
        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground mb-3">Jump to question:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              let isAnswered = answers[q.id] !== undefined;
              let isCurrent = idx === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
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
