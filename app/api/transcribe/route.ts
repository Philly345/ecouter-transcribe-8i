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

    console.log("Starting transcription for file:", file.name)

    // Step 1: Upload file to AssemblyAI
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to AssemblyAI")
    }

    const { upload_url } = await uploadResponse.json()
    console.log("File uploaded to:", upload_url)

    // Step 2: Request transcription
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_code: language,
        speaker_labels: speakerLabels,
        punctuate: punctuate,
        filter_profanity: filterProfanity,
        auto_highlights: true,
        sentiment_analysis: true,
      }),
    })

    if (!transcriptResponse.ok) {
      throw new Error("Failed to request transcription")
    }

    const { id: transcriptId } = await transcriptResponse.json()
    console.log("Transcription started with ID:", transcriptId)

    // Step 3: Poll for completion
    let transcript
    let attempts = 0
    const maxAttempts = 60 // 5 minutes max

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
        },
      })

      transcript = await statusResponse.json()
      console.log("Transcription status:", transcript.status)

      if (transcript.status === "completed") {
        break
      } else if (transcript.status === "error") {
        throw new Error("Transcription failed: " + transcript.error)
      }

      // Wait 5 seconds before next poll
      await new Promise((resolve) => setTimeout(resolve, 5000))
      attempts++
    }

    if (transcript.status !== "completed") {
      throw new Error("Transcription timeout")
    }

    console.log("Transcription completed, generating summary...")

    // Step 4: Generate summary and topics with Gemini
    let summary = "AI-generated summary not available"
    let topics = ["General Discussion"]
    let insights = "No insights available"

    try {
      // Improved prompt for better summary generation
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

      console.log("Gemini API response status:", geminiResponse.status)

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json()
        console.log("Gemini API response:", geminiData)

        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""
        console.log("Generated text:", generatedText)

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

          console.log("Parsed summary:", summary)
          console.log("Parsed topics:", topics)
          console.log("Parsed insights:", insights)
        }
      } else {
        const errorText = await geminiResponse.text()
        console.error("Gemini API error:", geminiResponse.status, errorText)
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
      file_name: file.name,
      file_size: file.size,
    }

    console.log("Transcription completed successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Transcription error:", error)
    return NextResponse.json({ error: "Transcription failed: " + (error as Error).message }, { status: 500 })
  }
}
