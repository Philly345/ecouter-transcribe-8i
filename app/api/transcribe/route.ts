import { type NextRequest, NextResponse } from "next/server"

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY
const GEMINI_API_KEY     = process.env.GEMINI_API_KEY
const R2_ACCOUNT_ID      = process.env.R2_ACCOUNT_ID
const R2_BUCKET_NAME     = process.env.R2_BUCKET_NAME

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
    // Step 1: Get the R2 file key and other options from the JSON request body.
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

    if (!R2_ACCOUNT_ID || !R2_BUCKET_NAME) {
      return createErrorResponse("R2 environment variables are not configured on the server.", 500)
    }

    // Construct the public URL for the file in Cloudflare R2.
    const audioUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`

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

      console.log("Transcription request status:", transcriptResponse.status)

      const transcriptResponseText = await transcriptResponse.text()
      console.log("Transcription response text (first 200 chars):", transcriptResponseText.substring(0, 200))

      if (!transcriptResponse.ok) {
        console.error("Transcription request failed:", transcriptResponse.status, transcriptResponseText)

        if (transcriptResponse.status === 401) {
          return createErrorResponse("Authentication failed. Please try again.", 401)
        }
        if (transcriptResponse.status === 400) {
          // Attempt to parse error from AssemblyAI
          try {
            const errorJson = JSON.parse(transcriptResponseText);
            const errorMessage = errorJson.error || "Invalid transcription request.";
            return createErrorResponse(`Transcription failed: ${errorMessage}`, 400);
          } catch {
            return createErrorResponse("Invalid transcription request. Please check your file and try again.", 400);
          }
        }

        return createErrorResponse(
          `Failed to start transcription: ${transcriptResponse.status}`,
          transcriptResponse.status,
        )
      }

      if (isHtmlResponse(transcriptResponseText)) {
        console.error("Transcription service returned HTML:", transcriptResponseText.substring(0, 500))
        return createErrorResponse("Transcription service error. Please try again.", 502)
      }

      try {
        transcriptData = JSON.parse(transcriptResponseText)
        console.log("Successfully parsed transcription response:", transcriptData)
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

    // Step 3: Poll for completion
    let transcript
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max (5 second intervals)

    while (attempts < maxAttempts) {
      try {
        console.log(`Checking transcription status (attempt ${attempts + 1})...`)

        const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: {
            authorization: ASSEMBLYAI_API_KEY,
          },
        })

        if (!statusResponse.ok) {
          console.error("Status check failed:", statusResponse.status)
          if (attempts > 5) { 
            return createErrorResponse("Failed to check transcription status. Please try again.", 502)
          }
        } else {
          const statusText = await statusResponse.text()

          if (isHtmlResponse(statusText)) {
            console.error("Status check returned HTML:", statusText.substring(0, 200))
            if (attempts > 5) {
              return createErrorResponse("Transcription service error. Please try again.", 502)
            }
          } else {
            try {
              transcript = JSON.parse(statusText)
              console.log(`Transcription status: ${transcript.status}`)

              if (transcript.status === "completed") {
                console.log("Transcription completed successfully")
                break
              } else if (transcript.status === "error") {
                console.error("Transcription error:", transcript.error)
                return createErrorResponse(`Transcription failed: ${transcript.error || "Unknown error"}`, 500)
              }
            } catch (parseError) {
              console.error("Failed to parse status response:", parseError)
              console.error("Response that failed parsing:", statusText)
              if (attempts > 5) {
                return createErrorResponse(`Invalid response from transcription service: ${parseError.message}`, 502)
              }
            }
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
        attempts++
      } catch (error) {
        console.error("Status polling error:", error)
        if (attempts > 10) { 
          return createErrorResponse("Network error during transcription. Please try again.", 500)
        }
        await new Promise((resolve) => setTimeout(resolve, 5000))
        attempts++
      }
    }

    if (!transcript || transcript.status !== "completed") {
      return createErrorResponse("Transcription timeout. Please try with a shorter file or contact support.", 408)
    }

    if (!transcript.text) {
      return createErrorResponse("Transcription completed but no text was generated. Please try again.", 500)
    }

    console.log("Transcription text length:", transcript.text.length)

    // Step 4: Generate summary and topics with Gemini
    let summary = "AI-generated summary not available"
    let topics = ["General Discussion"]
    let insights = "No insights available"

    try {
      console.log("Generating AI summary...")

      const maxTranscriptLength = 32000;
      const transcriptSnippet = transcript.text.length > maxTranscriptLength
        ? transcript.text.substring(0, maxTranscriptLength) + "...[truncated]"
        : transcript.text;

      const summaryPrompt = `Please analyze this transcript and provide a structured response:

TRANSCRIPT: "${transcriptSnippet}"

Please provide:
1. SUMMARY: Write a clear, concise summary in 2-3 sentences
2. TOPICS: List 3-5 main topics discussed (just the topic names, separated by commas)
3. INSIGHTS: Provide 1-2 key insights or takeaways

Format your response exactly like this:
SUMMARY: [Your summary here]
TOPICS: [topic1, topic2, topic3]
INSIGHTS: [Your insights here]`

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: summaryPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            ],
          }),
        },
      )

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json()
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""

        if (generatedText) {
          const summaryMatch = generatedText.match(/SUMMARY:\s*(.+?)(?=TOPICS:|$)/s)
          const topicsMatch = generatedText.match(/TOPICS:\s*(.+?)(?=INSIGHTS:|$)/s)
          const insightsMatch = generatedText.match(/INSIGHTS:\s*(.+?)$/s)

          if (summaryMatch) summary = summaryMatch[1].trim()
          if (topicsMatch) {
            topics = topicsMatch[1].trim().split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5)
          }
          if (insightsMatch) insights = insightsMatch[1].trim()

          console.log("AI summary generated successfully")
        }
      } else {
        console.error("Gemini API error:", geminiResponse.status)
      }
    } catch (error) {
      console.error("Gemini API error:", error)
    }

    // Step 5: Format response
    const speakers = transcript.utterances
      ? [...new Set(transcript.utterances.map((u: any) => u.speaker))]
      : ["Speaker A"]

    const timestamps = transcript.utterances
      ? transcript.utterances.map((u: any) => ({
          speaker: u.speaker,
          start: u.start,
          end: u.end,
          text: u.text,
        }))
      : []

    const result = {
      id: transcriptId,
      transcript: transcript.text,
      summary,
      topics,
      insights,
      speakers,
      timestamps,
      confidence: transcript.confidence || 0.95,
      duration: transcript.audio_duration || 0,
      word_count: transcript.words?.length || 0,
      language: language,
      created_at: new Date().toISOString(),
      file_name: fileName,
      file_size: fileSize,
    }

    console.log("Transcription process completed successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Unexpected transcription error:", error)

    if (error instanceof SyntaxError) {
        return createErrorResponse(`JSON Parsing Error: ${error.message}. Please check API responses.`, 500);
    }
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return createErrorResponse("Request timeout. Please try with a smaller file.", 408)
      }
      if (error.message.includes("network") || error.message.includes("fetch")) {
        return createErrorResponse("Network error. Please check your connection and try again.", 503)
      }
      return createErrorResponse(`Transcription failed: ${error.message}`, 500)
    }

    return createErrorResponse("An unexpected error occurred. Please try again.", 500)
  }
}
