import { type NextRequest, NextResponse } from "next/server"

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY
const GEMINI_API_KEY     = process.env.GEMINI_API_KEY
const R2_PUBLIC_URL      = process.env.R2_PUBLIC_URL // Using the new public URL

// Helper function to create error responses
function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

// Helper function to check if response is HTML
function isHtmlResponse(text: string): boolean {
  const trimmed = text.trim()
  return (
    trimmed.startsWith("<") || 
    trimmed.includes("<!DOCTYPE") || 
    trimmed.includes("<html") || 
    trimmed.includes("<HTML")
  )
}

export async function POST(request: NextRequest) {
  try {
    const { 
      key, 
      language = "en", 
      speakerLabels = false, 
      punctuate = false, 
      filterProfanity = false, 
      fileName = "audio.file", 
      fileSize = 0 
    } = await request.json()

    if (!key) {
      return createErrorResponse("No file key provided", 400)
    }

    if (!R2_PUBLIC_URL) {
      return createErrorResponse("R2_PUBLIC_URL environment variable is not configured.", 500)
    }

    // Construct the public URL using the r2.dev domain
    const audioUrl = `https://${R2_PUBLIC_URL}/${key}`

    console.log('Starting transcription for URL:', audioUrl)

    // Step 2: Request transcription from AssemblyAI
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

    console.log("Requesting transcription with config:", transcriptConfig)

    let transcriptResponse
    let transcriptData

    try {
      transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify(transcriptConfig),
      })

      const transcriptResponseText = await transcriptResponse.text()

      if (!transcriptResponse.ok) {
        console.error("Transcription request failed:", transcriptResponse.status, transcriptResponseText)
         try {
            const errorJson = JSON.parse(transcriptResponseText);
            return createErrorResponse(`Transcription failed: ${errorJson.error || 'Unknown error'}`, 400);
          } catch {
            return createErrorResponse(`Transcription request failed with status ${transcriptResponse.status}.`, 400);
          }
      }
      
      try {
        transcriptData = JSON.parse(transcriptResponseText)
      } catch (parseError) {
        console.error("Failed to parse transcription response:", parseError)
        console.error("Response that failed parsing:", transcriptResponseText)
        return createErrorResponse(`Invalid response from transcription service: ${parseError.message}`, 502)
      }

    } catch (error) {
      console.error("Transcription request failed:", error)
      return createErrorResponse("Failed to start transcription. Please try again.", 500)
    }

    const transcriptId = transcriptData.id
    if (!transcriptId) {
      console.error("No transcript ID in response:", transcriptData)
      return createErrorResponse("Transcription failed to start. Please try again.", 502)
    }

    console.log("Transcription started with ID:", transcriptId)

    // Polling logic... (remains the same)
    let transcript
    let attempts = 0
    const maxAttempts = 60

    while (attempts < maxAttempts) {
      try {
        const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { authorization: ASSEMBLYAI_API_KEY },
        })

        if (!statusResponse.ok) {
          if (attempts > 5) return createErrorResponse("Failed to check transcription status.", 502)
        } else {
          const statusText = await statusResponse.text()
          transcript = JSON.parse(statusText)

          if (transcript.status === "completed") {
            console.log("Transcription completed successfully")
            break
          } else if (transcript.status === "error") {
            return createErrorResponse(`Transcription failed: ${transcript.error || "Unknown error"}`, 500)
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 5000))
        attempts++
      } catch (error) {
        if (attempts > 10) return createErrorResponse("Network error during transcription.", 500)
        await new Promise((resolve) => setTimeout(resolve, 5000))
        attempts++
      }
    }

    if (!transcript || transcript.status !== "completed") {
      return createErrorResponse("Transcription timeout.", 408)
    }

    if (!transcript.text) {
      return createErrorResponse("Transcription completed but no text was generated.", 500)
    }

    // Gemini logic... (remains the same)
    let summary = "AI-generated summary not available"
    let topics = ["General Discussion"]
    let insights = "No insights available"

    try {
      const maxTranscriptLength = 32000;
      const transcriptSnippet = transcript.text.substring(0, maxTranscriptLength);
      const summaryPrompt = `Please analyze this transcript and provide a structured response:\n\nTRANSCRIPT: "${transcriptSnippet}"\n\nPlease provide:\n1. SUMMARY: Write a clear, concise summary in 2-3 sentences\n2. TOPICS: List 3-5 main topics discussed (just the topic names, separated by commas)\n3. INSIGHTS: Provide 1-2 key insights or takeaways\n\nFormat your response exactly like this:\nSUMMARY: [Your summary here]\nTOPICS: [topic1, topic2, topic3]\nINSIGHTS: [Your insights here]`
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: summaryPrompt }] }],
          }),
        },
      )
      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const summaryMatch = generatedText.match(/SUMMARY:\s*(.+?)(?=TOPICS:|$)/s);
        const topicsMatch = generatedText.match(/TOPICS:\s*(.+?)(?=INSIGHTS:|$)/s);
        const insightsMatch = generatedText.match(/INSIGHTS:\s*(.+?)$/s);
        if (summaryMatch) summary = summaryMatch[1].trim();
        if (topicsMatch) topics = topicsMatch[1].trim().split(",").map((t) => t.trim()).filter(Boolean);
        if (insightsMatch) insights = insightsMatch[1].trim();
      }
    } catch (error) {
      console.error("Gemini API error:", error)
    }

    // Final response object... (remains the same)
    const result = {
      id: transcriptId,
      transcript: transcript.text,
      summary,
      topics,
      insights,
      speakers: [...new Set(transcript.utterances?.map((u) => u.speaker) || ["A"])],
      timestamps: transcript.utterances?.map((u) => ({ speaker: u.speaker, start: u.start, end: u.end, text: u.text })) || [],
      confidence: transcript.confidence,
      duration: transcript.audio_duration,
      word_count: transcript.words?.length || 0,
      language: transcript.language_code,
      created_at: new Date().toISOString(),
      file_name: fileName,
      file_size: fileSize,
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error("Unexpected transcription error:", error)
    if (error instanceof SyntaxError) {
        return createErrorResponse(`JSON Parsing Error: ${error.message}. Please check API responses.`, 500);
    }
    return createErrorResponse("An unexpected error occurred. Please try again.", 500)
  }
}
