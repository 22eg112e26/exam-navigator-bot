// dashboard page - shows all features after pdf upload
// user can go to different sections from here

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileQuestion, 
  Lightbulb, 
  ClipboardCheck, 
  FileText, 
  BarChart3,
  FileUp,
  ArrowRight
} from 'lucide-react';
import { useStudy } from '@/lib/studyContext';
import { FeatureCard } from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { session } = useStudy();
  const navigate = useNavigate();

  // if no session redirect to home
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <FileUp className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">No Document Uploaded</h2>
          <p className="text-muted-foreground mb-6">
            Please upload a PDF document first to access the study tools.
          </p>
          <Button onClick={() => navigate('/')} size="lg">
            Upload PDF
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  console.log("dashboard loaded for:", session.pdfName);

  // feature cards data
  let featureList = [
    {
      title: 'Important Questions',
      description: 'Generate exam-oriented questions categorized by marks (2, 4, 6 marks)',
      icon: FileQuestion,
      href: '/questions',
      color: 'primary' as const,
    },
    {
      title: 'Key Topics',
      description: 'Extract important topics and concepts for quick revision',
      icon: Lightbulb,
      href: '/topics',
      color: 'accent' as const,
    },
    {
      title: 'Mock Test',
      description: 'Take a 20-question MCQ test to evaluate your understanding',
      icon: ClipboardCheck,
      href: '/mock-test',
      color: 'success' as const,
    },
    {
      title: 'Question Paper',
      description: 'Generate a complete exam-style question paper',
      icon: FileText,
      href: '/question-paper',
      color: 'info' as const,
    },
    {
      title: 'Performance Analysis',
      description: 'View detailed analysis of your mock test performance',
      icon: BarChart3,
      href: '/performance',
      color: 'warning' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* header section */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Document Ready
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Study Dashboard
          </h1>
          <p className="text-muted-foreground">
            Analyzing: <span className="font-medium text-foreground">{session.pdfName}</span>
          </p>
        </div>

        {/* feature cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((f, i) => (
            <FeatureCard
              key={i}
              {...f}
            />
          ))}
        </div>

        {/* upload new button */}
        <div className="mt-12 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Upload Different Document
          </Button>
        </div>
      </div>
    </div>
  );
}
