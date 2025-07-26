import { type NextRequest, NextResponse } from "next/server"

const ASSEMBLYAI_API_KEY = "bc57f2d5b98d4271a3edb82d84e83dda"
const GEMINI_API_KEY = "AIzaSyArajy9zhyYWCnBYs5kcSIaIyL87D652_g"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const language = (formData.get("language") as string) || "en"
    const speakerLabels = formData.get("speakerLabels") === "true"
    const punctuate = formData.get("punctuate") === "true"
    const filterProfanity = formData.get("filterProfanity") === "true"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Starting transcription for file:", file.name, "Language:", language)

    // Step 1: Upload file to AssemblyAI
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        "content-type": "application/octet-stream",
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("Upload error:", uploadResponse.status, errorText)
      throw new Error(`Failed to upload file to AssemblyAI: ${uploadResponse.status}`)
    }

    const uploadData = await uploadResponse.json()
    const uploadUrl = uploadData.upload_url
    console.log("File uploaded to:", uploadUrl)

    // Step 2: Request transcription
    const transcriptConfig = {
      audio_url: uploadUrl,
      language_code: language,
      speaker_labels: speakerLabels,
      punctuate: punctuate,
      filter_profanity: filterProfanity,
      auto_highlights: true,
      sentiment_analysis: true,
      format_text: true,
    }

    console.log("Transcription config:", transcriptConfig)

    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(transcriptConfig),
    })

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text()
      console.error("Transcription request error:", transcriptResponse.status, errorText)
      throw new Error(`Failed to request transcription: ${transcriptResponse.status}`)
    }

    const transcriptData = await transcriptResponse.json()
    const transcriptId = transcriptData.id
    console.log("Transcription started with ID:", transcriptId)

    // Step 3: Poll for completion
    let transcript
    let attempts = 0
    const maxAttempts = 120

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
        },
      })

      if (!statusResponse.ok) {
        console.error("Status check failed:", statusResponse.status)
        throw new Error("Failed to check transcription status")
      }

      transcript = await statusResponse.json()
      console.log(`Transcription status (attempt ${attempts + 1}):`, transcript.status)

      if (transcript.status === "completed") {
        break
      } else if (transcript.status === "error") {
        console.error("Transcription error:", transcript.error)
        throw new Error("Transcription failed: " + transcript.error)
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
      attempts++
    }

    if (transcript.status !== "completed") {
      throw new Error("Transcription timeout - please try again with a shorter file")
    }

    console.log("Transcription completed, generating summary...")

    // Step 4: Generate summary and topics with Gemini
    let summary = "AI-generated summary not available"
    let topics = ["General Discussion"]
    let insights = "No insights available"

    try {
      const summaryPrompt = `Please analyze this transcript and provide a structured response:

TRANSCRIPT: "${transcript.text}"

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
            const topicsText = topicsMatch[1].trim()
            topics = topicsText
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t.length > 0)
              .slice(0, 5)
          }
          if (insightsMatch) insights = insightsMatch[1].trim()
        }
      } else {
        console.error("Gemini API error:", geminiResponse.status)
      }
    } catch (error) {
      console.error("Gemini API processing error:", error)
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
      file_name: file.name,
      file_size: file.size,
    }

    console.log("Transcription completed successfully")
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Transcription error:", error)

    const message =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "An unknown error occurred during transcription"

    return new NextResponse(
      JSON.stringify({ error: "Transcription failed: " + message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
}

