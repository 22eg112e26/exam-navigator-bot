// question paper page
// generates a full exam style paper with sections

import React, { useEffect, useState } from 'react';
import { FileText, Clock, Award, Printer } from 'lucide-react';
import { useStudy } from '@/lib/studyContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { LoadingState } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// section type
interface Section {
  name: string;
  marks: number;
  instructions: string;
  questions: string[];
}

// paper type
interface PaperData {
  title: string;
  totalMarks: number;
  duration: string;
  sections: Section[];
}

export default function QuestionPaper() {
  const { session } = useStudy();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState<PaperData | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/');
      return;
    }

    // generating paper from ai
    async function getPaper() {
      console.log("generating question paper...");
      try {
        let reqBody = { pdfContent: session.pdfContent, type: 'questionPaper' };
        const { data, error } = await supabase.functions.invoke('analyze-pdf', {
          body: reqBody,
        });

        if (error) throw error;

        let result = data.result;
        if (result) {
          console.log("paper generated, sections:", result.sections?.length);
          setPaper(result);
        }
      } catch (err) {
        console.log('error generating paper:', err);
        toast.error('Failed to generate question paper. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    getPaper();
  }, [session, navigate]);

  // print function
  function printPaper() {
    console.log("printing paper...");
    window.print();
  }

  if (!session) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <PageHeader
            title="Question Paper"
            description="Generating exam paper..."
            icon={FileText}
          />
          <LoadingState message="Creating complete exam paper..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="print:hidden">
          <PageHeader
            title="Question Paper"
            description="Complete exam-style question paper"
            icon={FileText}
          />
        </div>

        {paper ? (
          <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
            {/* paper header */}
            <div className="p-8 border-b border-border text-center bg-muted/30">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">
                {paper.title}
              </h2>
              <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Total Marks: <strong className="text-foreground">{paper.totalMarks}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Duration: <strong className="text-foreground">{paper.duration}</strong></span>
                </div>
              </div>
            </div>

            {/* instructions */}
            <div className="p-6 border-b border-border bg-warning/5">
              <h3 className="font-semibold text-foreground mb-2">General Instructions:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Read all questions carefully before answering</li>
                <li>Write answers in neat and legible handwriting</li>
                <li>Start each section on a new page</li>
                <li>Marks are indicated against each question</li>
              </ul>
            </div>

            {/* sections */}
            <div className="p-8 space-y-10">
              {paper.sections.map((sec, secIdx) => (
                <div key={secIdx}>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground">{sec.name}</h3>
                    <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                      {sec.marks} marks each
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    {sec.instructions}
                  </p>
                  <ol className="space-y-4">
                    {sec.questions.map((q, qIdx) => (
                      <li key={qIdx} className="flex gap-4 p-4 rounded-xl bg-muted/30">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                          {secIdx + 1}.{qIdx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-foreground leading-relaxed">{q}</p>
                          <span className="inline-block mt-2 text-xs text-muted-foreground">
                            [{sec.marks} marks]
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>

            {/* footer */}
            <div className="p-6 border-t border-border bg-muted/30 text-center">
              <p className="text-sm text-muted-foreground">*** End of Question Paper ***</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No question paper generated. Please try again.</p>
          </div>
        )}

        {/* print button */}
        <div className="mt-8 flex justify-center print:hidden">
          <Button onClick={printPaper} variant="outline" size="lg">
            <Printer className="w-4 h-4 mr-2" />
            Print Question Paper
          </Button>
        </div>
      </div>
    </div>
  );
}
