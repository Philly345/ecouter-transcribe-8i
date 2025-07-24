import { type NextRequest, NextResponse } from "next/server"

const MYMEMORY_EMAIL = "phillyrick34@gmail.com"

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = "en" } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Use MyMemory API for translation
    const url = new URL("https://api.mymemory.translated.net/get")
    url.searchParams.append("q", text)
    url.searchParams.append("langpair", `${sourceLanguage}|${targetLanguage}`)
    url.searchParams.append("de", MYMEMORY_EMAIL)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error("Translation service unavailable")
    }

    const data = await response.json()

    if (data.responseStatus !== 200) {
      throw new Error("Translation failed")
    }

    return NextResponse.json({
      translatedText: data.responseData.translatedText,
      sourceLanguage,
      targetLanguage,
    })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: "Translation failed: " + (error as Error).message }, { status: 500 })
  }
}
