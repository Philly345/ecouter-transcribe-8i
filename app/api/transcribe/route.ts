// app/api/transcribe/route.ts
import { type NextRequest, NextResponse } from "next/server";

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY!;
const GEMINI_API_KEY     = process.env.GEMINI_API_KEY!;

// ---------- helpers ----------
function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
function isHtmlResponse(text: string): boolean {
  const trimmed = text.trim();
  return (
    trimmed.startsWith("<") ||
    trimmed.includes("<!DOCTYPE") ||
    trimmed.includes("<html") ||
    trimmed.includes("<HTML")
  );
}

// ---------- main ----------
export async function POST(request: NextRequest) {
  try {
    /* 1️⃣ read JSON payload */
    const {
      key,
      language = "en",
      speakerLabels = false,
      punctuate = true,
      filterProfanity = false,
    } = await request.json();

    if (!key) return createErrorResponse("No key provided", 400);

    /* 2️⃣ build the R2 public URL */
    const audioUrl = `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;

    console.log(
      "Starting transcription for URL:",
      audioUrl,
      "Language:",
      language,
      "Speaker Labels:",
      speakerLabels
    );

    /* ---------- Step 2: Request transcription ---------- */
    const transcriptConfig = {
      audio_url: audioUrl,
      language_code: language,
      speaker_labels: speakerLabels,
      punctuate,
      filter_profanity: filterProfanity,
      auto_highlights: true,
      sentiment_analysis: true,
      format_text: true,
    };

    let transcriptResponse, transcriptData;

    /* 2-a: start transcription */
    try {
      transcriptResponse = await fetch(
        "https://api.assemblyai.com/v2/transcript",
        {
          method: "POST",
          headers: {
            authorization: ASSEMBLYAI_API_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify(transcriptConfig),
        }
      );

      console.log("Transcription request status:", transcriptResponse.status);

      const transcriptResponseText = await transcriptResponse.text();
      console.log(
        "Transcription response text:",
        transcriptResponseText.substring(0, 200)
      );

      if (!transcriptResponse.ok) {
        console.error(
          "Transcription request failed:",
          transcriptResponse.status,
          transcriptResponseText
        );
        if (transcriptResponse.status === 401)
          return createErrorResponse(
            "Authentication failed. Please try again.",
            401
          );
        if (transcriptResponse.status === 400)
          return createErrorResponse(
            "Invalid transcription request. Please check your file and try again.",
            400
          );
        return createErrorResponse(
          `Failed to start transcription: ${transcriptResponse.status}`,
          transcriptResponse.status
        );
      }

      if (isHtmlResponse(transcriptResponseText)) {
        console.error(
          "Transcription service returned HTML:",
          transcriptResponseText.substring(0, 500)
        );
        return createErrorResponse(
          "Transcription service error. Please try again.",
          502
        );
      }

      transcriptData = JSON.parse(transcriptResponseText);
      console.log(
        "Successfully parsed transcription response:",
        transcriptData
      );
    } catch (error) {
      console.error("Transcription request failed:", error);
      return createErrorResponse(
        "Failed to start transcription. Please try again.",
        500
      );
    }

    const transcriptId = transcriptData.id;
    if (!transcriptId)
      return createErrorResponse(
        "Transcription failed to start. Please try again.",
        502
      );
    console.log("Transcription started with ID:", transcriptId);

    /* 2-b: poll for completion */
    let transcript;
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      try {
        console.log(
          `Checking transcription status (attempt ${attempts + 1})...`
        );
        const statusResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          { headers: { authorization: ASSEMBLYAI_API_KEY } }
        );

        if (!statusResponse.ok) {
          console.error("Status check failed:", statusResponse.status);
          if (attempts > 5)
            return createErrorResponse(
              "Failed to check transcription status. Please try again.",
              502
            );
        } else {
          const statusText = await statusResponse.text();

          if (isHtmlResponse(statusText)) {
            console.error(
              "Status check returned HTML:",
              statusText.substring(0, 200)
            );
            if (attempts > 5)
              return createErrorResponse(
                "Transcription service error. Please try again.",
                502
              );
          } else {
            transcript = JSON.parse(statusText);
            console.log(`Transcription status: ${transcript.status}`);

            if (transcript.status === "completed") {
              console.log("Transcription completed successfully");
              break;
            } else if (transcript.status === "error") {
              console.error("Transcription error:", transcript.error);
              return createErrorResponse(
                `Transcription failed: ${transcript.error || "Unknown error"}`,
                500
              );
            }
          }
        }
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;
      } catch (error) {
        console.error("Status polling error:", error);
        if (attempts > 10)
          return createErrorResponse(
            "Network error during transcription. Please try again.",
            500
          );
        await new Promise((r) => setTimeout(r, 5000));
        attempts++;
      }
    }

    if (!transcript || transcript.status !== "completed")
      return createErrorResponse(
        "Transcription timeout. Please try with a shorter file or contact support.",
        408
      );
    if (!transcript.text)
      return createErrorResponse(
        "Transcription completed but no text was generated. Please try again.",
        500
      );

    console.log("Transcription text length:", transcript.text.length);

    /* ---------- Step 3: Gemini summary ---------- */
    let summary = "AI-generated summary not available";
    let topics = ["General Discussion"];
    let insights = "No insights available";

    try {
      const maxLen = 32000;
      const snippet =
        transcript.text.length > maxLen
          ? transcript.text.substring(0, maxLen) + "...[truncated]"
          : transcript.text;

      const prompt = `Please analyze this transcript and provide a structured response:

TRANSCRIPT: "${snippet}"

Please provide:
1. SUMMARY: Write a clear, concise summary in 2-3 sentences
2. TOPICS: List 3-5 main topics discussed (just the topic names, separated by commas)
3. INSIGHTS: Provide 1-2 key insights or takeaways

Format your response exactly like this:
SUMMARY: [Your summary here]
TOPICS: [topic1, topic2, topic3]
INSIGHTS: [Your insights here]`;

      const geminiResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" +
          GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
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
        }
      );

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const sum = generatedText.match(/SUMMARY:\s*(.+?)(?=TOPICS:|$)/s);
        const top = generatedText.match(/TOPICS:\s*(.+?)(?=INSIGHTS:|$)/s);
        const ins = generatedText.match(/INSIGHTS:\s*(.+?)$/s);

        if (sum) summary = sum[1].trim();
        if (top)
          topics = top[1]
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 5);
        if (ins) insights = ins[1].trim();
      }
    } catch (error) {
      console.error("Gemini API error:", error);
    }

    /* ---------- Final response ---------- */
    const speakers = transcript.utterances
      ? [...new Set(transcript.utterances.map((u: any) => u.speaker))]
      : ["Speaker A"];
    const timestamps = transcript.utterances
      ? transcript.utterances.map((u: any) => ({
          speaker: u.speaker,
          start: u.start,
          end: u.end,
          text: u.text,
        }))
      : [];

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
      file_size: 0,
    });
  } catch (err) {
    console.error("Unexpected transcription error:", err);
    return createErrorResponse("Unexpected server error", 500);
  }
}
