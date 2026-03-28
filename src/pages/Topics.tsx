// topics page - shows important topics from pdf
// topics have importance level - high, medium, low

import React, { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useStudy } from '@/lib/studyContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState } from '@/components/LoadingState';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// topic type
interface Topic {
  title: string;
  description: string;
  importance: 'high' | 'medium' | 'low';
}

export default function Topics() {
  const { session } = useStudy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topicsList, setTopicsList] = useState<Topic[]>([]);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    // getting topics from ai
    async function getTopics() {
      console.log("extracting topics...");
      try {
        let reqData = { pdfContent: session.pdfContent, type: 'topics' };
        const { data, error } = await supabase.functions.invoke('analyze-pdf', {
          body: reqData,
        });

        if (error) throw error;

        let result = data.result;
        if (result?.topics) {
          console.log("got", result.topics.length, "topics");
          setTopicsList(result.topics);
        }
      } catch (err) {
        console.log('error extracting topics:', err);
        toast.error('Failed to extract topics. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    getTopics();
  }, [session, navigate]);

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <PageHeader
            title="Key Topics"
            description="Extracting important topics..."
            icon={Lightbulb}
          />
          <LoadingState message="Extracting key topics..." />
        </div>
      </div>
    );
  }

  // icons for importance
  let impIcon: Record<string, JSX.Element> = {
    high: <TrendingUp className="w-4 h-4" />,
    medium: <Minus className="w-4 h-4" />,
    low: <TrendingDown className="w-4 h-4" />,
  };

  // colors for importance
  let impColors: Record<string, string> = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning-foreground border-warning/20',
    low: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <PageHeader
          title="Key Topics"
          description="Important topics for revision and last-minute study"
          icon={Lightbulb}
        />

        {topicsList.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {topicsList.map((t, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-card border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {t.title}
                  </h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${impColors[t.importance]}`}>
                    {impIcon[t.importance]}
                    {t.importance}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No topics extracted. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
