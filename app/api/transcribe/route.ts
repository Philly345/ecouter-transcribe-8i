import { type NextRequest, NextResponse } from "next/server"

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY
const GEMINI_API_KEY     = process.env.GEMINI_API_KEY

export const config = {
  api: { bodyParser: { sizeLimit: '1kb' } }, // only needs to parse JSON keys
}

function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

function isHtmlResponse(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.startsWith("<") || trimmed.includes("<!DOCTYPE") || trimmed.includes("<html")
}

export async function POST(request: NextRequest) {
  try {
    const { key, language = "en", speakerLabels, punctuate, filterProfanity } = await request.json()

    if (!key) return createErrorResponse("Missing R2 object key", 400)

    const audioUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`
    console.log("Starting transcription for URL:", audioUrl)

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
        authorization: ASSEMBLYAI_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify(transcriptConfig),
    })

    const transcriptResponseText = await transcriptResponse.text()

    if (!transcriptResponse.ok || isHtmlResponse(transcriptResponseText)) {
      console.error("Failed to start transcription:", transcriptResponse.status, transcriptResponseText)
      return createErrorResponse("Failed to start transcription. Please try again.", 502)
    }

    const transcriptData = JSON.parse(transcriptResponseText)
    const transcriptId = transcriptData.id
    if (!transcriptId) return createErrorResponse("No transcript ID returned", 502)

    // Polling for completion
    let attempts = 0
    let transcript = null
    while (attempts < 60) {
      const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: ASSEMBLYAI_API_KEY! },
      })

      const statusText = await statusRes.text()
      if (isHtmlResponse(statusText)) break

      try {
        transcript = JSON.parse(statusText)
        if (transcript.status === "completed") break
        if (transcript.status === "error") {
          return createErrorResponse(`Transcription failed: ${transcript.error}`, 500)
        }
      } catch {
        console.warn("Polling JSON parse error, retrying...")
      }

      await new Promise((res) => setTimeout(res, 5000))
      attempts++
    }

    if (!transcript || transcript.status !== "completed") {
      return createErrorResponse("Transcription timed out or failed.", 408)
    }

    // Generate Gemini summary
    let summary = "AI-generated summary not available"
    let topics = ["General Discussion"]
    let insights = "No insights available"

    try {
      const maxTranscriptLength = 32000
      const transcriptSnippet = transcript.text.length > maxTranscriptLength
        ? transcript.text.slice(0, maxTranscriptLength) + "...[truncated]"
        : transcript.text

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

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: summaryPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      )

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json()
        const output = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""

        const summaryMatch = output.match(/SUMMARY:\s*(.+?)(?=TOPICS:|$)/s)
        const topicsMatch = output.match(/TOPICS:\s*(.+?)(?=INSIGHTS:|$)/s)
        const insightsMatch = output.match(/INSIGHTS:\s*(.+?)$/s)

        if (summaryMatch) summary = summaryMatch[1].trim()
        if (topicsMatch) {
          topics = topicsMatch[1].split(",").map(t => t.trim()).slice(0, 5)
        }
        if (insightsMatch) insights = insightsMatch[1].trim()
      } else {
        console.warn("Gemini API failed:", geminiRes.status)
      }
    } catch (err) {
      console.error("Gemini summary generation failed:", err)
    }

    const speakers = transcript.utterances
      ? [...new Set(transcript.utterances.map((u: any) => u.speaker))]
      : ["Speaker A"]

    const timestamps = transcript.utterances?.map((u: any) => ({
      speaker: u.speaker,
      start: u.start,
      end: u.end,
      text: u.text,
    })) || []

    return NextResponse.json({
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
      language,
      created_at: new Date().toISOString(),
      file_name: key.split("/").pop(),
      file_size: transcript.audio_size || 0,
    })
  } catch (error) {
    console.error("Unhandled error:", error)
    return createErrorResponse("Unexpected server error. Please try again.", 500)
  }
}

