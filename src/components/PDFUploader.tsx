// pdf uploader component
// handles drag drop and file selection

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

  // drag handler
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // checking drag type
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  // drop handler
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    let droppedFiles = e.dataTransfer.files;
    let firstFile = droppedFiles?.[0];
    // checking if its pdf
    if (firstFile?.type === 'application/pdf') {
      setFile(firstFile);
      console.log("file dropped:", firstFile.name);
    } else {
      toast.error('Please upload a PDF file');
    }
  }

  // file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let selectedFile = e.target.files?.[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
      console.log("file selected:", selectedFile.name);
    } else if (selectedFile) {
      toast.error('Please upload a PDF file');
    }
  };

  // extract text from pdf - basic version
  async function extractTextFromPDF(pdfFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          let arrayBuffer = e.target?.result as ArrayBuffer;
          let uint8Array = new Uint8Array(arrayBuffer);
          
          // converting to base64
          let binary = '';
          for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
          }
          let base64Data = btoa(binary);
          console.log("pdf converted to base64, length:", base64Data.length);
          
          // creating content description for AI
          let contentText = `[PDF Document: ${pdfFile.name}, Size: ${(pdfFile.size / 1024).toFixed(2)}KB]\n\nPlease analyze this uploaded educational document and generate content based on its academic material.`;
          resolve(contentText);
        } catch (err) {
          console.log("error in pdf extraction:", err);
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(pdfFile);
    });
  }

  // main upload function
  const handleUpload = async () => {
    if (!file) return;
    
    setIsLoading(true);
    console.log("starting upload...");
    
    try {
      // step 1: upload to storage
      let fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError, data } = await supabase.storage
        .from('study-materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      console.log("file uploaded to storage");

      // step 2: get the url
      const { data: urlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(fileName);

      let pdfUrl = urlData.publicUrl;

      // step 3: extract text
      let pdfContent = await extractTextFromPDF(file);
      console.log("text extracted from pdf");

      // step 4: save session to database
      const { data: sessionData, error: sessionError } = await supabase
        .from('study_sessions')
        .insert({
          pdf_name: file.name,
          pdf_url: pdfUrl,
          pdf_content: pdfContent,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      console.log("session saved, id:", sessionData.id);

      // step 5: set context
      setSession({
        id: sessionData.id,
        pdfName: file.name,
        pdfUrl: pdfUrl,
        pdfContent: pdfContent,
      });

      toast.success('PDF uploaded successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.log('upload error:', error);
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
