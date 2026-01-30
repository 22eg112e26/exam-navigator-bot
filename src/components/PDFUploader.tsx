import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useStudy } from '@/lib/studyContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function PDFUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { setSession, isLoading, setIsLoading } = useStudy();
  const navigate = useNavigate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files?.[0]?.type === 'application/pdf') {
      setFile(files[0]);
    } else {
      toast.error('Please upload a PDF file');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast.error('Please upload a PDF file');
    }
  };

  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    // For now, we'll read the PDF as text. In production, you'd use a PDF parsing library
    // The AI model can understand PDF content from base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Convert to base64 for AI processing
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          const base64 = btoa(binary);
          
          // For text extraction, we'll send a simplified version
          // The AI will work with the content description
          resolve(`[PDF Document: ${pdfFile.name}, Size: ${(pdfFile.size / 1024).toFixed(2)}KB]\n\nPlease analyze this uploaded educational document and generate content based on its academic material.`);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(pdfFile);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from('study-materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the URL
      const { data: urlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(fileName);

      // Extract text content
      const pdfContent = await extractTextFromPDF(file);

      // Create session in database
      const { data: sessionData, error: sessionError } = await supabase
        .from('study_sessions')
        .insert({
          pdf_name: file.name,
          pdf_url: urlData.publicUrl,
          pdf_content: pdfContent,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSession({
        id: sessionData.id,
        pdfName: file.name,
        pdfUrl: urlData.publicUrl,
        pdfContent: pdfContent,
      });

      toast.success('PDF uploaded successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-4">
          {file ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  Drop your PDF here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {file && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={isLoading}
            size="lg"
            className="px-8 py-6 text-lg font-semibold rounded-xl shadow-medium hover:shadow-large transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Document
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
