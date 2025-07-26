// app/api/transcribe/route.ts
import { type NextRequest, NextResponse } from "next/server";

// Use environment variables for security
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper function to create error responses
function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // Get form data from request
    const formData = await request.formData();
    
    // Extract parameters
    const audioFile = formData.get("file") as File;
    const language = formData.get("language")?.toString() || "en";
    const speakerLabels = formData.get("speakerLabels")?.toString() === "true";
    const punctuate = formData.get("punctuate")?.toString() === "true";
    const filterProfanity = formData.get("filterProfanity")?.toString() === "true";
    const fileName = formData.get("fileName")?.toString() || "audio_file";
    const fileSize = parseInt(formData.get("fileSize")?.toString() || "0");

    // Validate file
    if (!audioFile) {
      return createErrorResponse("No audio file provided", 400);
    }

    // Validate file size (50MB max)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return createErrorResponse(`File size exceeds limit (${MAX_SIZE/1024/1024}MB)`, 413);
    }

    console.log('Starting transcription for file:', fileName);

    // Step 1: Upload file to AssemblyAI
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY!,
      },
      body: Buffer.from(await audioFile.arrayBuffer())
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      return createErrorResponse(`AssemblyAI upload failed: ${errorData.error}`, 502);
    }

    const { upload_url: audioUrl } = await uploadResponse.json();
    console.log('File uploaded to AssemblyAI. URL:', audioUrl);

    // Step 2: Request transcription
    const transcriptConfig = {
      audio_url: audioUrl,
      language_code: language,
      speaker_labels: speakerLabels,
      punctuate: punctuate,
      filter_profanity: filterProfanity,
      auto_highlights: true,
      sentiment_analysis: true,
      format_text: true,
    };

    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify(transcriptConfig),
    });
    
    const transcriptResponseData = await transcriptResponse.json();
    if (!transcriptResponse.ok) {
      return createErrorResponse(`Failed to start transcription: ${transcriptResponseData.error}`, 400);
    }

    const transcriptId = transcriptResponseData.id;
    if (!transcriptId) {
      return createErrorResponse("Transcription failed to start (no ID received).", 502);
    }
    console.log("Transcription started with ID:", transcriptId);

    // Step 3: Poll for completion
    let transcript;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes (5s * 120)
    while (attempts < maxAttempts) {
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: ASSEMBLYAI_API_KEY! },
      });
      
      transcript = await pollResponse.json();
      
      // Exit loop if completed or errored
      if (transcript.status === "completed" || transcript.status === "error") {
        break;
      }
      
      // Wait 5 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!transcript || transcript.status !== "completed") {
      return createErrorResponse(
        `Transcription timed out or failed: ${transcript?.error || "Unknown error"}`,
        504
      );
    }

    // Step 4: Generate summary with Gemini (optional)
    let summary = "AI-generated summary not available";
    let topics = ["General Discussion"];
    let insights = "No insights available";
    
    if (GEMINI_API_KEY) {
      try {
        const maxTranscriptLength = 32000;
        const transcriptSnippet = transcript.text.substring(0, maxTranscriptLength);
        const summaryPrompt = `Analyze this transcript:\n\n"${transcriptSnippet}"\n\nProvide:\n1. SUMMARY: A 2-3 sentence summary.\n2. TOPICS: 3-5 main topics, comma-separated.\n3. INSIGHTS: 1-2 key insights.\n\nFormat your response exactly like this:\nSUMMARY: [Your summary]\nTOPICS: [topic1, topic2]\nINSIGHTS: [Your insights]`;
        
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              contents: [{ 
                parts: [{ 
                  text: summaryPrompt 
                }] 
              }] 
            }),
          }
        );
        
        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Parse response
          const summaryMatch = generatedText.match(/SUMMARY:\s*(.+?)(?=TOPICS:|$)/s);
          const topicsMatch = generatedText.match(/TOPICS:\s*(.+?)(?=INSIGHTS:|$)/s);
          const insightsMatch = generatedText.match(/INSIGHTS:\s*(.+?)$/s);
          
          if (summaryMatch) summary = summaryMatch[1].trim();
          if (topicsMatch) topics = topicsMatch[1].trim().split(",").map(t => t.trim()).filter(Boolean);
          if (insightsMatch) insights = insightsMatch[1].trim();
        }
      } catch (error) {
        console.error("Gemini API error:", error);
      }
    } else {
      console.warn("Gemini API key not configured. Skipping summary generation.");
    }
    
    // Step 5: Format final response
    const result = {
      id: transcriptId,
      transcript: transcript.text,
      summary,
      topics,
      insights,
      speakers: [...new Set(transcript.utterances?.map((u: any) => u.speaker) || ["A"])],
      timestamps: transcript.utterances?.map((u: any) => ({ 
        speaker: u.speaker, 
        start: u.start, 
        end: u.end, 
        text: u.text 
      })) || [],
      confidence: transcript.confidence || 0.95,
      duration: transcript.audio_duration || 0,
      word_count: transcript.words?.length || 0,
      language: transcript.language_code || language,
      created_at: new Date().toISOString(),
      file_name: fileName,
      file_size: fileSize,
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Unexpected transcription error:", error);
    return createErrorResponse(
      error.message || "An unexpected error occurred. Please try again.", 
      500
    );
  }
}
