import { type NextRequest, NextResponse } from "next/server"

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Configure body parser for small JSON payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1kb'  // Only need to parse small JSON objects
    },
  },
}

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
    // Parse JSON body instead of FormData
    const { key, language, speakerLabels, punctuate, filterProfanity } = await request.json()
    
    // Construct audio URL from Cloudflare R2
    const audioUrl = `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`
    
    // Validate required parameters
    if (!key) {
      return createErrorResponse("Missing object key", 400)
    }
    if (!ASSEMBLYAI_API_KEY) {
      return createErrorResponse("AssemblyAI API key not configured", 500)
    }

    console.log('Starting transcription for URL:', audioUrl)
    console.log('Language:', language || 'en')
    console.log('Options:', { speakerLabels, punctuate, filterProfanity })

    // Step 1: Request transcription
    const transcriptConfig = {
      audio_url: audioUrl,
      language_code: language || "en",
      speaker_labels: speakerLabels || false,
      punctuate: punctuate || true,
      filter_profanity: filterProfanity || false,
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
          return createErrorResponse("Invalid transcription request. Please check your audio URL and try again.", 400)
        }

        return createErrorResponse(
          `Failed to start transcription: ${transcriptResponse.status}`,
          transcriptResponse.status,
        )
      }

      // Check if transcription response is HTML
      if (isHtmlResponse(transcriptResponseText)) {
        console.error("Transcription service returned HTML:", transcriptResponseText.substring(0, 500))
        return createErrorResponse("Transcription service error. Please try again.", 502)
      }

      try {
        transcriptData = JSON.parse(transcriptResponseText)
        console.log("Successfully parsed transcription response:", transcriptData)
      } catch (parseError) {
        console.error("Failed to parse transcription response:", parseError)
        return createErrorResponse("Invalid response from transcription service. Please try again.", 502)
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

    // Step 2: Poll for completion
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
          // Continue trying for a few more attempts
          if (attempts > 5) {
            return createErrorResponse("Failed to check transcription status. Please try again.", 502)
          }
        } else {
          const statusText = await statusResponse.text()

          // Check if status response is HTML
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
              if (attempts > 5) {
                return createErrorResponse("Invalid response from transcription service. Please try again.", 502)
              }
            }
          }
        }

        // Wait 5 seconds before next poll
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
      return createErrorResponse("Transcription timeout. Please try again later.", 408)
    }

    if (!transcript.text) {
      return createErrorResponse("Transcription completed but no text was generated. Please try again.", 500)
    }

    console.log("Transcription text length:", transcript.text.length)

    // Step 3: Generate summary and topics with Gemini
    let summary = "AI-generated summary not available"
    let topics = ["General Discussion"]
    let insights = "No insights available"

    if (GEMINI_API_KEY) {
      try {
        console.log("Generating AI summary...")

        // Truncate transcript to Gemini's token limit
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
              contents: [
                {
                  parts: [
                    {
                      text: summaryPrompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE",
                },
              ],
            }),
          },
        )

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json()
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""

          if (generatedText) {
            // Parse the structured response
            const summaryMatch = generatedText.match(/SUMMARY:\s*(.+?)(?=TOPICS:|$)/s)
            const topicsMatch = generatedText.match(/TOPICS:\s*(.+?)(?=INSIGHTS:|$)/s)
            const insightsMatch = generatedText.match(/INSIGHTS:\s*(.+?)$/s)

            if (summaryMatch) {
              summary = summaryMatch[1].trim()
            }

            if (topicsMatch) {
              const topicsText = topicsMatch[1].trim()
              topics = topicsText
                .split(",")
                .map((topic) => topic.trim())
                .filter((topic) => topic.length > 0)
                .slice(0, 5)
            }

            if (insightsMatch) {
              insights = insightsMatch[1].trim()
            }

            console.log("AI summary generated successfully")
          }
        } else {
          console.error("Gemini API error:", geminiResponse.status)
        }
      } catch (error) {
        console.error("Gemini API error:", error)
      }
    } else {
      console.log("Skipping Gemini summary - API key not configured")
    }

    // Step 4: Format response
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
      language: language || "en",
      created_at: new Date().toISOString(),
      audio_url: audioUrl,
    }

    console.log("Transcription process completed successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Unexpected transcription error:", error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return createErrorResponse("Request timeout. Please try again.", 408)
      }
      if (error.message.includes("network") || error.message.includes("fetch")) {
        return createErrorResponse("Network error. Please check your connection and try again.", 503)
      }
      return createErrorResponse(`Transcription failed: ${error.message}`, 500)
    }

    return createErrorResponse("An unexpected error occurred. Please try again.", 500)
  }
}
