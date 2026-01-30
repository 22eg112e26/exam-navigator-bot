import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfContent, type, testAnswers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "questions":
        systemPrompt = `You are an expert academic question paper generator. Your task is to analyze study material and generate exam-oriented important questions. 

CRITICAL RULES:
1. Generate questions ONLY from the provided content
2. Classify questions strictly into 2 marks, 4 marks, and 6 marks categories
3. Questions must be concept-focused and suitable for academic exams
4. Output MUST be valid JSON

Output format:
{
  "twoMarks": ["question1", "question2", ...],
  "fourMarks": ["question1", "question2", ...],
  "sixMarks": ["question1", "question2", ...]
}`;
        userPrompt = `Analyze the following study material and generate important exam questions categorized by marks:\n\n${pdfContent}`;
        break;

      case "topics":
        systemPrompt = `You are an expert at extracting key topics from academic content. Your task is to identify the most important topics for exam preparation.

CRITICAL RULES:
1. Extract topics ONLY from the provided content
2. Focus on key concepts, major headings, and important sub-topics
3. Topics should be useful for revision and last-minute study
4. Output MUST be valid JSON

Output format:
{
  "topics": [
    {"title": "Topic Name", "description": "Brief description", "importance": "high/medium/low"},
    ...
  ]
}`;
        userPrompt = `Extract the most important topics from this study material:\n\n${pdfContent}`;
        break;

      case "mockTest":
        systemPrompt = `You are an expert MCQ generator for academic exams. Your task is to create a balanced mock test.

CRITICAL RULES:
1. Generate EXACTLY 20 MCQs from the provided content
2. Each MCQ must have exactly 4 options (A, B, C, D)
3. Only ONE correct answer per question
4. Mix of Easy (7), Medium (8), and Hard (5) questions
5. Output MUST be valid JSON

Output format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": {"A": "option1", "B": "option2", "C": "option3", "D": "option4"},
      "correct": "A",
      "difficulty": "easy/medium/hard",
      "explanation": "Brief explanation"
    },
    ...
  ]
}`;
        userPrompt = `Generate a 20-question MCQ mock test from this study material:\n\n${pdfContent}`;
        break;

      case "questionPaper":
        systemPrompt = `You are an expert academic question paper designer. Create a complete exam-style question paper.

CRITICAL RULES:
1. Create questions ONLY from the provided content
2. Follow realistic academic patterns
3. Include proper sections with mark allocations
4. Output MUST be valid JSON

Output format:
{
  "title": "Examination Question Paper",
  "totalMarks": 70,
  "duration": "3 hours",
  "sections": [
    {
      "name": "Section A",
      "marks": 2,
      "instructions": "Answer any 5 questions",
      "questions": ["q1", "q2", ...]
    },
    {
      "name": "Section B", 
      "marks": 4,
      "instructions": "Answer any 4 questions",
      "questions": ["q1", "q2", ...]
    },
    {
      "name": "Section C",
      "marks": 6,
      "instructions": "Answer any 3 questions",
      "questions": ["q1", "q2", ...]
    }
  ]
}`;
        userPrompt = `Create a complete examination question paper from this study material:\n\n${pdfContent}`;
        break;

      case "analyze":
        systemPrompt = `You are an expert performance analyzer for academic tests. Analyze the student's mock test performance.

CRITICAL RULES:
1. Provide detailed performance analysis
2. Identify strong and weak topics
3. Give actionable improvement suggestions
4. Output MUST be valid JSON

Output format:
{
  "summary": {
    "totalQuestions": 20,
    "correct": number,
    "wrong": number,
    "accuracy": number
  },
  "strongTopics": ["topic1", "topic2"],
  "weakTopics": ["topic1", "topic2"],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "topicWiseAnalysis": [
    {"topic": "name", "performance": "good/average/poor", "recommendation": "text"}
  ]
}`;
        userPrompt = `Analyze this mock test performance. Study material:\n${pdfContent}\n\nTest answers with results:\n${JSON.stringify(testAnswers)}`;
        break;

      default:
        throw new Error("Invalid analysis type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Extract JSON from the response
    let jsonContent = content;
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    // Try to parse as JSON, if fails return raw content
    try {
      const parsed = JSON.parse(jsonContent);
      return new Response(JSON.stringify({ result: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch {
      return new Response(JSON.stringify({ result: content }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
