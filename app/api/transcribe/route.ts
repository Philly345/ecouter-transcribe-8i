import { type NextRequest, NextResponse } from "next/server";

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const GEMINI_API_KEY     = process.env.GEMINI_API_KEY;

export const config = {
  api: { bodyParser: { sizeLimit: "1kb" } }, // tiny JSON only
};

// ---------- helpers ----------
function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function isHtmlResponse(text: string): boolean {
  const t = text.trim();
  return t.startsWith("<") || t.includes("<!DOCTYPE") || t.includes("<html") || t.includes("<HTML");
}

// ---------- main handler ----------
export async function POST(request: NextRequest) {
  try {
    /* ---------- 1️⃣ Read JSON body ---------- */
    const {
      key,
      language = "en",
      speakerLabels = false,
      punctuate = true,
      filterProfanity = false,
    } = await request.json();

    if (!key) {
      return createErrorResponse("Missing key", 400);
    }

    /* ---------- 2️⃣ Build public Cloudflare-R2 URL ---------- */
    const audioUrl = `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;

    console.log("Transcribing URL:", audioUrl);

    /* ---------- 3️⃣ Tell AssemblyAI to transcribe ---------- */
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

    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: ASSEMBLYAI_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify(transcriptConfig),
    });

    if (!transcriptResponse.ok) {
      const text = await transcriptResponse.text();
      console.error("AssemblyAI start error:", transcriptResponse.status, text);
      return createErrorResponse(
        `Failed to start transcription: ${transcriptResponse.status}`,
        transcriptResponse.status
      );
    }

    const { id: transcriptId } = await transcriptResponse.json();
    if (!transcriptId) {
      return createErrorResponse("No transcript ID returned", 502);
    }

    /* ---------- 4️⃣ Poll until complete ---------- */
    let transcript;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5 s interval)

    while (attempts < maxAttempts) {
      const statusRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { authorization: ASSEMBLYAI_API_KEY! },
      });

      if (!statusRes.ok) {
        if (attempts > 5) {
          return createErrorResponse("Status-check failed", 502);
        }
      } else {
        const data = await statusRes.json();
        if (data.status === "completed") {
          transcript = data;
          break;
        }
        if (data.status === "error") {
          return createErrorResponse(`Transcription error: ${data.error}`, 500);
        }
      }
      await new Promise((r) => setTimeout(r, 5000));
      attempts++;
    }

    if (!transcript || transcript.status !== "completed") {
      return createErrorResponse("Transcription timeout", 408);
    }

    /* ---------- 5️⃣ Gemini summary ---------- */
    let summary = "AI-generated summary not available";
    let topics  = ["General Discussion"];
    let insights = "No insights available";

    try {
      const maxLen = 32000;
      const snippet =
        transcript.text.length > maxLen
          ? transcript.text.substring(0, maxLen) + "...[truncated]"
          : transcript.text;

      const prompt = `
TRANSCRIPT: "${snippet}"

Please provide:
1. SUMMARY: Write a clear, concise summary in 2-3 sentences
2. TOPICS: List 3-5 main topics discussed (comma-separated)
3. INSIGHTS: Provide 1-2 key takeaways

Format:
SUMMARY: ...
TOPICS: topic1, topic2, topic3
INSIGHTS: ...
`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
          }),
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const sum = text.match(/SUMMARY:\s*(.+?)(?=TOPICS:|$)/s);
        const top = text.match(/TOPICS:\s*(.+?)(?=INSIGHTS:|$)/s);
        const ins = text.match(/INSIGHTS:\s*(.+?)$/s);

        if (sum) summary = sum[1].trim();
        if (top) topics = top[1].split(",").map((t: string) => t.trim()).filter(Boolean).slice(0, 5);
        if (ins) insights = ins[1].trim();
      }
    } catch (e) {
      console.error("Gemini error:", e);
    }

    /* ---------- 6️⃣ Final response ---------- */
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
      file_name: key.split("/").pop(), // filename from key
      file_size: 0, // not known when using R2 key
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return createErrorResponse("Unexpected server error", 500);
  }
}
