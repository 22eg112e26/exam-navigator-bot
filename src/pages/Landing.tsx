import React from 'react';
import { BookOpen, Brain, GraduationCap, Sparkles } from 'lucide-react';
import { PDFUploader } from '@/components/PDFUploader';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Intelligent Study Companion
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-slide-up">
              <span className="text-gradient">EduGenius</span>
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-muted-foreground mb-6 animate-slide-up">
              An AI-Powered Intelligent Study Companion for
              <span className="block text-foreground mt-2">Automated Question Generation and Personalized Learning</span>
            </h2>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Upload your PDF notes and let AI generate important questions, mock tests, 
              and comprehensive exam papers tailored to your syllabus.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {[
                { icon: BookOpen, text: 'Important Questions' },
                { icon: Brain, text: 'Smart Topics' },
                { icon: GraduationCap, text: 'Mock Tests' },
                { icon: Sparkles, text: 'Performance Analysis' },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 justify-center p-3 rounded-xl bg-card border border-border"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-card-foreground">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Upload section */}
            <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <PDFUploader />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three simple steps to transform your study material into exam-ready content
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Upload PDF',
                description: 'Upload your lecture notes, textbook chapters, or any study material in PDF format.',
              },
              {
                step: '02',
                title: 'AI Analysis',
                description: 'Our AI thoroughly analyzes your content to understand key concepts and topics.',
              },
              {
                step: '03',
                title: 'Get Results',
                description: 'Access questions, mock tests, and personalized performance insights instantly.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Info Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">A Major Project Report</h2>
            <p className="text-lg text-muted-foreground">
              Submitted in partial fulfilment of the requirements for the award of the degree
            </p>
            <div>
              <p className="text-xl font-bold text-primary">BACHELOR OF TECHNOLOGY</p>
              <p className="text-lg font-semibold text-foreground">IN</p>
              <p className="text-xl font-bold text-primary">INFORMATION TECHNOLOGY</p>
            </div>

            <div className="pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Submitted By</p>
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { name: 'A. Abhinav Goud' },
                  { name: 'N. Nanda Kishore' },
                  { name: 'K. Sainath' },
                ].map((student, i) => (
                  <div key={i} className="px-5 py-3 rounded-xl bg-card border border-border">
                    <p className="font-semibold text-card-foreground">{student.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">Under the Guidance of</p>
              <p className="text-lg font-semibold text-foreground">Mr. I. Mahesh Kumar Swamy</p>
              <p className="text-sm text-muted-foreground">Assistant Professor</p>
              <p className="text-sm text-muted-foreground">Department of Information Technology</p>
            </div>

            <div className="pt-6 border-t border-border mt-6">
              <p className="text-xl font-bold text-foreground">ANURAG UNIVERSITY</p>
              <p className="text-xs text-muted-foreground mt-1">
                (Approved by AICTE and NBA Accredited) Venkatapur (V), Ghatkesar (M), Medchal District, Hyderabad, Telangana - 500088
              </p>
              <p className="text-sm font-medium text-muted-foreground mt-2">2022 – 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2026 EduGenius — Anurag University. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
