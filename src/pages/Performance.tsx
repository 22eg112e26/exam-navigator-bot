import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Target, Lightbulb } from 'lucide-react';
import { useStudy } from '@/lib/studyContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState } from '@/components/LoadingState';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface PerformanceData {
  summary: {
    totalQuestions: number;
    correct: number;
    wrong: number;
    accuracy: number;
  };
  strongTopics: string[];
  weakTopics: string[];
  suggestions: string[];
  topicWiseAnalysis: Array<{
    topic: string;
    performance: 'good' | 'average' | 'poor';
    recommendation: string;
  }>;
}

export default function Performance() {
  const { session } = useStudy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    async function fetchPerformance() {
      try {
        // Get latest test result
        const { data: results, error: resultsError } = await supabase
          .from('mock_test_results')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (resultsError) throw resultsError;

        if (!results || results.length === 0) {
          toast.error('No test results found. Please take a mock test first.');
          navigate('/mock-test');
          return;
        }

        setTestResult(results[0]);

        // Get AI analysis
        const { data, error } = await supabase.functions.invoke('analyze-pdf', {
          body: { 
            pdfContent: session.pdfContent, 
            type: 'analyze',
            testAnswers: results[0]
          },
        });

        if (error) throw error;

        if (data.result) {
          setPerformance(data.result);
        }
      } catch (error) {
        console.error('Error fetching performance:', error);
        toast.error('Failed to analyze performance. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPerformance();
  }, [session, navigate]);

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <PageHeader
            title="Performance Analysis"
            description="Analyzing your results..."
            icon={BarChart3}
          />
          <LoadingState message="Generating performance insights..." />
        </div>
      </div>
    );
  }

  if (!testResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No test results available.</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Correct', value: testResult.correct_answers, color: 'hsl(var(--success))' },
    { name: 'Wrong', value: testResult.wrong_answers, color: 'hsl(var(--destructive))' },
  ];

  const performanceColors = {
    good: 'text-success',
    average: 'text-warning-foreground',
    poor: 'text-destructive',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <PageHeader
          title="Performance Analysis"
          description="Detailed insights from your mock test"
          icon={BarChart3}
        />

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-card border border-border shadow-soft">
            <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
            <p className="text-3xl font-bold text-foreground">{testResult.total_questions}</p>
          </div>
          <div className="p-6 rounded-xl bg-success/10 border border-success/20">
            <p className="text-sm text-success mb-1">Correct Answers</p>
            <p className="text-3xl font-bold text-success">{testResult.correct_answers}</p>
          </div>
          <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive mb-1">Wrong Answers</p>
            <p className="text-3xl font-bold text-destructive">{testResult.wrong_answers}</p>
          </div>
          <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary mb-1">Accuracy</p>
            <p className="text-3xl font-bold text-primary">{Number(testResult.accuracy).toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-soft">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Score Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-muted-foreground">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strong & Weak Topics */}
          <div className="space-y-4">
            {performance?.strongTopics && performance.strongTopics.length > 0 && (
              <div className="p-6 rounded-xl bg-success/5 border border-success/20">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <h3 className="text-lg font-semibold text-foreground">Strong Topics</h3>
                </div>
                <ul className="space-y-2">
                  {performance.strongTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {performance?.weakTopics && performance.weakTopics.length > 0 && (
              <div className="p-6 rounded-xl bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                  <h3 className="text-lg font-semibold text-foreground">Needs Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {performance.weakTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {performance?.suggestions && performance.suggestions.length > 0 && (
          <div className="mt-8 p-6 rounded-xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-accent-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Improvement Suggestions</h3>
            </div>
            <ul className="grid md:grid-cols-2 gap-3">
              {performance.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                  <Target className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground text-sm">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Topic-wise Analysis */}
        {performance?.topicWiseAnalysis && performance.topicWiseAnalysis.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Topic-wise Analysis</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performance.topicWiseAnalysis.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-card border border-border shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-card-foreground">{item.topic}</h4>
                    <span className={`text-sm font-medium capitalize ${performanceColors[item.performance]}`}>
                      {item.performance}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
