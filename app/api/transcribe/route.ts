import { type NextRequest, NextResponse } from "next/server"

// Use environment variables for security
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY
const GEMINI_API_KEY     = process.env.GEMINI_API_KEY
const R2_PUBLIC_URL      = process.env.R2_PUBLIC_URL

// Helper function to create error responses
function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  try {
    // This route now accepts JSON with a key, not a file
    const { 
      key, 
      language = "en", 
      speakerLabels = false, 
      punctuate = false, 
      filterProfanity = false, 
      fileName, 
      fileSize 
    } = await request.json()

    if (!key) {
      return createErrorResponse("No file key provided", 400)
    }
    if (!R2_PUBLIC_URL) {
      return createErrorResponse("R2_PUBLIC_URL environment variable is not configured.", 500)
    }

    // Construct the public URL using the key from R2
    const audioUrl = `https://${R2_PUBLIC_URL}/${key}`
    console.log('Starting transcription for URL:', audioUrl)

    // Step 1: Request transcription from AssemblyAI
    const transcriptConfig = {
      audio_url: audioUrl,
      language_code: language,
      speaker_labels: speakerLabels,
      punctuate: punctuate,
      filter_profanity: filterProfanity,
      auto_highlights: true,
      sentiment_analysis: true,
      format_text: true,
    }

    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(transcriptConfig),
    })
    
    const transcriptResponseData = await transcriptResponse.json()
    if (!transcriptResponse.ok) {
      return createErrorResponse(`Failed to start transcription: ${transcriptResponseData.error}`, 400)
    }

    const transcriptId = transcriptResponseData.id
    if (!transcriptId) {
      return createErrorResponse("Transcription failed to start (no ID received).", 502)
    }
    console.log("Transcription started with ID:", transcriptId)

    // Step 2: Poll for completion
    let transcript;
    let attempts = 0;
    while (attempts < 60) {
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: ASSEMBLYAI_API_KEY },
      });
      transcript = await pollResponse.json();
      if (transcript.status === "completed" || transcript.status === "error") {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!transcript || transcript.status !== "completed") {
      return createErrorResponse(`Transcription timed out or failed: ${transcript?.error || "Unknown error"}`, 500);
    }

    // Step 3: Generate summary with Gemini (logic is unchanged)
    let summary = "AI-generated summary not available"
    let topics = ["General Discussion"]
    let insights = "No insights available"
    try {
      const maxTranscriptLength = 32000;
      const transcriptSnippet = transcript.text.substring(0, maxTranscriptLength);
      const summaryPrompt = `Analyze this transcript:\n\n"${transcriptSnippet}"\n\nProvide:\n1. SUMMARY: A 2-3 sentence summary.\n2. TOPICS: 3-5 main topics, comma-separated.\n3. INSIGHTS: 1-2 key insights.\n\nFormat your response exactly like this:\nSUMMARY: [Your summary]\nTOPICS: [topic1, topic2]\nINSIGHTS: [Your insights]`;
      
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: summaryPrompt }] }] }),
      });
      
      if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
    
    // Step 4: Format final response
    const result = {
      id: transcriptId,
      transcript: transcript.text,
      summary,
      topics,
      insights,
      speakers: [...new Set(transcript.utterances?.map((u) => u.speaker) || ["A"])],
      timestamps: transcript.utterances?.map((u) => ({ speaker: u.speaker, start: u.start, end: u.end, text: u.text })) || [],
      confidence: transcript.confidence || 0.95,
      duration: transcript.audio_duration || 0,
      word_count: transcript.words?.length || 0,
      language: transcript.language_code || language,
      created_at: new Date().toISOString(),
      file_name: fileName,
      file_size: fileSize,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Unexpected transcription error:", error)
    return createErrorResponse("An unexpected error occurred. Please try again.", 500)
  }
}
