import { type NextRequest, NextResponse } from "next/server"

// ✅ THIS IS THE NEWLY ADDED CONFIGURATION
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb", // Increase the server's accepted file size
    },
  },
}

// User's original API keys
const ASSEMBLYAI_API_KEY = "bc57f2d5b98d4271a3edb82d84e83dda"
const GEMINI_API_KEY = "AIzaSyArajy9zhyYWCnBYs5kcSIaIyL87D652_g"

// Helper function to create error responses
function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

// Helper function to check if response is HTML
function isHtmlResponse(text: string): boolean {
  const trimmed = text.trim()
  return (
    trimmed.startsWith("<") || trimmed.includes("<!DOCTYPE") || trimmed.includes("<html") || trimmed.includes("<HTML")
  )
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const language = (formData.get("language") as string) || "en"
    const speakerLabels = formData.get("speakerLabels") === "true"
    const punctuate = formData.get("punctuate") === "true"
    const filterProfanity = formData.get("filterProfanity") === "true"

    if (!file) {
      return createErrorResponse("No file provided", 400)
    }

    // Your manual file size validation (good practice!)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return createErrorResponse(
        "File too large. Maximum size is 50MB. Please compress your file or contact support for larger files.",
        413,
      )
    }

    // Validate file type
    const isAudio = file.type.startsWith("audio/")
    const isVideo = file.type.startsWith("video/")
    if (!isAudio && !isVideo) {
      return createErrorResponse("Invalid file type. Please upload an audio or video file.", 400)
    }

    console.log(
      "Starting transcription for file:",
      file.name,
      "Size:",
      file.size,
      "Type:",
      file.type,
      "Language:",
      language,
    )

    // Step 1: Upload file to AssemblyAI
    let uploadResponse
    let uploadData

    try {
      console.log("Uploading file to AssemblyAI...")
      const fileBuffer = await file.arrayBuffer()

      uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
          "content-type": "application/octet-stream",
        },
        body: fileBuffer,
      })

      console.log("Upload response status:", uploadResponse.status)
      const responseText = await uploadResponse.text()
      console.log("Upload response text (first 200 chars):", responseText.substring(0, 200))

      if (isHtmlResponse(responseText)) {
        console.error("Received HTML response instead of JSON:", responseText.substring(0, 500))
        if (responseText.includes("Request Entity Too Large") || responseText.includes("413")) {
          return createErrorResponse("File too large for upload. Please use a smaller file (max 25MB).", 413)
        }
        if (responseText.includes("Bad Gateway") || responseText.includes("502")) {
          return createErrorResponse("Upload service temporarily unavailable. Please try again in a few minutes.", 502)
        }
        return createErrorResponse("Upload service returned an error. Please try again or contact support.", 502)
      }

      if (!uploadResponse.ok) {
        console.error("Upload failed with status:", uploadResponse.status)
        if (uploadResponse.status === 413) {
          return createErrorResponse("File too large for upload. Please use a smaller file.", 413)
        }
        return createErrorResponse(
          `Upload failed with status ${uploadResponse.status}. Please try again.`,
          uploadResponse.status,
        )
      }

      try {
        uploadData = JSON.parse(responseText)
        console.log("Successfully parsed upload response:", uploadData)
      } catch (parseError) {
        console.error("Failed to parse upload response as JSON:", parseError)
        console.error("Response text was:", responseText)
        return createErrorResponse(
          "Upload service returned invalid response. Please try again or contact support.",
          502,
        )
      }
    } catch (error) {
      console.error("Upload request failed:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return createErrorResponse("Network error during upload. Please check your connection and try again.", 503)
      }
      return createErrorResponse("Upload request failed. Please try again.", 500)
    }

    if (!uploadData || !uploadData.upload_url) {
      console.error("No upload_url in response:", uploadData)
      return createErrorResponse("Upload completed but no URL received. Please try again.", 502)
    }

    const uploadUrl = uploadData.upload_url
    console.log("File uploaded successfully to:", uploadUrl)

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

    // Step 3: Poll for completion
    let transcript
    const maxAttempts = 60 // 5 minutes max (5 second intervals)
    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      console.log(`Checking transcription status (attempt ${attempts + 1})...`)
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
        },
      })

      if (statusResponse.ok) {
        transcript = await statusResponse.json()
        console.log(`Transcription status: ${transcript.status}`)
        if (transcript.status === "completed") {
          console.log("Transcription completed successfully")
          break
        }
        if (transcript.status === "error") {
          console.error("Transcription error:", transcript.error)
          return createErrorResponse(`Transcription failed: ${transcript.error || "Unknown error"}`, 500)
        }
      } else {
        console.error("Status check failed:", statusResponse.status)
      }
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    if (!transcript || transcript.status !== "completed") {
      return createErrorResponse("Transcription timeout. Please try with a shorter file or contact support.", 408)
    }

    if (!transcript.text) {
      return createErrorResponse("Transcription completed but no text was generated. Please try again.", 500)
    }

    // Step 4: Generate summary and topics with Gemini
    let summary = "AI-generated summary not available"
    let topics = ["General Discussion"]
    let insights = "No insights available"

    try {
      console.log("Generating AI summary...")
      const summaryPrompt = `Please analyze this transcript and provide a structured response:\n\nTRANSCRIPT: "${transcript.text.substring(0, 8000)}"${transcript.text.length > 8000 ? "...[truncated]" : ""}\n\nPlease provide:\n1. SUMMARY: Write a clear, concise summary in 2-3 sentences\n2. TOPICS: List 3-5 main topics discussed (just the topic names, separated by commas)\n3. INSIGHTS: Provide 1-2 key insights or takeaways\n\nFormat your response exactly like this:\nSUMMARY: [Your summary here]\nTOPICS: [topic1, topic2, topic3]\nINSIGHTS: [Your insights here]`

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
        const geminiData = await geminiResponse.json()
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ""

        if (generatedText) {
          const summaryMatch = generatedText.match(/SUMMARY:\s*(.+?)(?=TOPICS:|$)/s)
          const topicsMatch = generatedText.match(/TOPICS:\s*(.+?)(?=INSIGHTS:|$)/s)
          const insightsMatch = generatedText.match(/INSIGHTS:\s*(.+?)$/s)

          if (summaryMatch) summary = summaryMatch[1].trim()
          if (topicsMatch) {
            topics = topicsMatch[1]
              .trim()
              .split(",")
              .map((topic) => topic.trim())
              .filter(Boolean)
              .slice(0, 5)
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
    const result = {
      id: transcriptId,
      transcript: transcript.text,
      summary,
      topics,
      insights,
      timestamps: transcript.utterances
        ? transcript.utterances.map((u: any) => ({
            speaker: u.speaker,
            start: u.start,
            end: u.end,
            text: u.text,
          }))
        : [],
      confidence: transcript.confidence || 0.95,
      duration: transcript.audio_duration || 0,
      word_count: transcript.words?.length || 0,
      language: language,
      created_at: new Date().toISOString(),
      file_name: file.name,
      file_size: file.size,
    }

    console.log("Transcription process completed successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("Unexpected transcription error:", error)
    if (error instanceof Error) {
      if (error.message.includes("network") || error.message.includes("fetch")) {
        return createErrorResponse("Network error. Please check your connection and try again.", 503)
      }
      return createErrorResponse(`Transcription failed: ${error.message}`, 500)
    }
    return createErrorResponse("An unexpected error occurred. Please try again.", 500)
  }
}
