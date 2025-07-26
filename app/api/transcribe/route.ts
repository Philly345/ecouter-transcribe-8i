// app/api/transcribe/route.ts
import { type NextRequest, NextResponse } from "next/server";

const ASSEMBLYAI_API_KEY = "bc57f2d5b98d4271a3edb82d84e83dda";
const GEMINI_API_KEY     = "AIzaSyArajy9zhyYWCnBYs5kcSIaIyL87D652_g";

/* ---------- helpers ---------- */
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

/* ---------- main ---------- */
export async function POST(request: NextRequest) {
  try {
    /* 1️⃣ read FormData (original flow) */
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const language = (formData.get("language") as string) || "en";
    const speakerLabels = formData.get("speakerLabels") === "true";
    const punctuate = formData.get("punctuate") === "true";
    const filterProfanity = formData.get("filterProfanity") === "true";

    if (!file) return createErrorResponse("No file provided", 400);

    /* 2️⃣ file checks */
    const MAX_DIRECT_UPLOAD_SIZE = 25 * 1024 * 1024; // 25 MB
    const MAX_RESUMABLE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB
    if (file.size > MAX_RESUMABLE_SIZE)
      return createErrorResponse("File too large (> 5 GB)", 413);

    const isAudio = file.type.startsWith("audio/");
    const isVideo = file.type.startsWith("video/");
    if (!isAudio && !isVideo)
      return createErrorResponse("Invalid file type", 400);

    console.log(
      "Starting transcription for file:",
      file.name,
      "Size:",
      file.size,
      "Type:",
      file.type,
      "Language:",
      language
    );

    /* 3️⃣ upload to AssemblyAI */
    let uploadData: { upload_url: string };
    try {
      console.log("Uploading file to AssemblyAI...");
      const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: { authorization: ASSEMBLYAI_API_KEY },
        body: file.size <= MAX_DIRECT_UPLOAD_SIZE
          ? await file.arrayBuffer()
          : file.stream(),
      });

      const responseText = await uploadResponse.text();
      if (!uploadResponse.ok || isHtmlResponse(responseText))
        return createErrorResponse("Upload failed", uploadResponse.status || 502);
      uploadData = JSON.parse(responseText);
    } catch (err) {
      console.error("Upload request failed:", err);
      return createErrorResponse("Upload request failed", 500);
    }

    if (!uploadData?.upload_url)
      return createErrorResponse("No upload URL received", 502);

    const uploadUrl = uploadData.upload_url;
    console.log("File uploaded successfully to:", uploadUrl);

    /* 4️⃣ request transcription */
    const transcriptConfig = {
      audio_url: uploadUrl,
      language_code: language,
      speaker_labels: speakerLabels,
      punctuate,
      filter_profanity: filterProfanity,
      auto_highlights: true,
      sentiment_analysis: true,
      format_text: true,
    };

    let transcriptData: { id: string };
    try {
      const transcriptResponse = await fetch(
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

      const transcriptText = await transcriptResponse.text();
      if (!transcriptResponse.ok || isHtmlResponse(transcriptText))
        return createErrorResponse(
          `Failed to start transcription: ${transcriptResponse.status}`,
          transcriptResponse.status
        );
      transcriptData = JSON.parse(transcriptText);
    } catch (err) {
      console.error("Transcription request failed:", err);
      return createErrorResponse("Failed to start transcription", 500);
    }

    const transcriptId = transcriptData.id;
    if (!transcriptId)
      return createErrorResponse("No transcript ID returned", 502);
    console.log("Transcription started with ID:", transcriptId);

    /* 5️⃣ poll until complete */
    let transcript: any;
    for (let attempts = 0; attempts < 60; attempts++) {
      try {
        const statusResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          { headers: { authorization: ASSEMBLYAI_API_KEY } }
        );
        transcript = await statusResponse.json();

        if (transcript.status === "completed") break;
        if (transcript.status === "error")
          return createErrorResponse(
            `Transcription failed: ${transcript.error || "Unknown error"}`,
            500
          );
        await new Promise((r) => setTimeout(r, 5000));
      } catch (err) {
        if (attempts > 5)
          return createErrorResponse(
            "Network error during transcription polling",
            500
          );
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    if (!transcript || transcript.status !== "completed")
      return createErrorResponse("Transcription timeout", 408);
    if (!transcript.text)
      return createErrorResponse("No text generated", 500);

    console.log("Transcription text length:", transcript.text.length);

    /* 6️⃣ Gemini summary */
    let summary = "AI-generated summary not available";
    let topics = ["General Discussion"];
    let insights = "No insights available";

    try {
      const snippet =
        transcript.text.length > 32000
          ? transcript.text.substring(0, 32000) + "...[truncated]"
          : transcript.text;

      const prompt = `TRANSCRIPT: "${snippet}"

Please provide:
1. SUMMARY: 2–3 concise sentences
2. TOPICS: comma-separated list (3–5)
3. INSIGHTS: 1–2 key takeaways

Format:
SUMMARY: ...
TOPICS: ...
INSIGHTS: ...`;

      const geminiRes = await fetch(
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
          }),
        }
      );
      if (geminiRes.ok) {
        const txt =
          (await geminiRes.json())?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const sum = txt.match(/SUMMARY:\s*(.+?)(?=TOPICS:|$)/s);
        const top = txt.match(/TOPICS:\s*(.+?)(?=INSIGHTS:|$)/s);
        const ins = txt.match(/INSIGHTS:\s*(.+?)$/s);
        if (sum) summary = sum[1].trim();
        if (top)
          topics = top[1].split(",").map((t) => t.trim()).filter(Boolean).slice(0, 5);
        if (ins) insights = ins[1].trim();
      }
    } catch (e) {
      console.error("Gemini error:", e);
    }

    /* 7️⃣ final payload */
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
      file_name: file.name,
      file_size: file.size,
    });
  } catch (error) {
    console.error("Unexpected transcription error:", error);
    if (error instanceof Error) {
      if (error.message.includes("timeout"))
        return createErrorResponse("Request timeout", 408);
      if (error.message.includes("network") || error.message.includes("fetch"))
        return createErrorResponse("Network error", 503);
      return createErrorResponse(`Transcription failed: ${error.message}`, 500);
    }
    return createErrorResponse("An unexpected error occurred", 500);
  }
}
