import { type NextRequest, NextResponse } from "next/server"

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY
const GEMINI_API_KEY     = process.env.GEMINI_API_KEY
const R2_PUBLIC_URL      = process.env.R2_PUBLIC_URL

function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  try {
    const { key, language = "en", fileName = "audio.file" } = await request.json()

    // DEBUGGING: Check if the key and environment variable are loaded correctly
    console.log('DEBUG: Received key:', key);
    console.log('DEBUG: R2_PUBLIC_URL from env:', R2_PUBLIC_URL);

    if (!key) return createErrorResponse("No file key provided", 400)
    if (!R2_PUBLIC_URL) return createErrorResponse("R2_PUBLIC_URL env variable not configured.", 500)

    const audioUrl = `https://${R2_PUBLIC_URL}/${key}`

    // DEBUGGING: Log the final URL before sending it
    console.log('DEBUG: Final audioUrl sent to AssemblyAI:', audioUrl);

    const transcriptConfig = {
      audio_url: audioUrl,
      language_code: language
    }
    
    let transcriptResponse
    try {
      transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          authorization: ASSEMBLYAI_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify(transcriptConfig),
      })
    } catch (error) {
      console.error("DEBUG: Fetch request to AssemblyAI failed.", error)
      return createErrorResponse("Network error: Failed to reach AssemblyAI.", 500)
    }

    const transcriptResponseText = await transcriptResponse.text()

    if (!transcriptResponse.ok) {
        console.error("DEBUG: Request to AssemblyAI was not OK. Status:", transcriptResponse.status);
        // DEBUGGING: Log the FULL error response body from AssemblyAI
        console.error('DEBUG: Full error response from AssemblyAI:', transcriptResponseText);
        try {
            const errorJson = JSON.parse(transcriptResponseText);
            return createErrorResponse(`Transcription failed: ${errorJson.error || 'Unknown error'}`, 400);
        } catch {
            return createErrorResponse(`Transcription request failed. Full error logged on server.`, 400);
        }
    }
    
    // The rest of the logic remains the same...
    const transcriptData = JSON.parse(transcriptResponseText)
    const transcriptId = transcriptData.id
    if (!transcriptId) {
      return createErrorResponse("Transcription failed to start (no ID received).", 502)
    }

    let transcript
    let attempts = 0
    while (attempts < 60) {
        const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
            headers: { authorization: ASSEMBLYAI_API_KEY },
        })
        transcript = await statusResponse.json();
        if (transcript.status === "completed" || transcript.status === "error") break;
        await new Promise((resolve) => setTimeout(resolve, 5000));
        attempts++;
    }

    if (transcript?.status === 'error') {
        return createErrorResponse(`Transcription failed: ${transcript.error}`, 500)
    }

    return NextResponse.json(transcript);

  } catch (error) {
    console.error("DEBUG: An unexpected error occurred in the POST handler.", error)
    if (error instanceof SyntaxError) {
        // This is the error you are seeing
        return createErrorResponse(`JSON Parsing Error: ${error.message}. Please check API responses.`, 500);
    }
    return createErrorResponse("An unexpected critical error occurred.", 500)
  }
}
