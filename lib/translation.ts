export const languages = [
  { code: "af", name: "Afrikaans", assemblyCode: "af" },
  { code: "sq", name: "Albanian", assemblyCode: "sq" },
  { code: "am", name: "Amharic", assemblyCode: "am" },
  { code: "ar", name: "Arabic", assemblyCode: "ar" },
  { code: "hy", name: "Armenian", assemblyCode: "hy" },
  { code: "az", name: "Azerbaijani", assemblyCode: "az" },
  { code: "eu", name: "Basque", assemblyCode: "eu" },
  { code: "be", name: "Belarusian", assemblyCode: "be" },
  { code: "bn", name: "Bengali", assemblyCode: "bn" },
  { code: "bs", name: "Bosnian", assemblyCode: "bs" },
  { code: "bg", name: "Bulgarian", assemblyCode: "bg" },
  { code: "ca", name: "Catalan", assemblyCode: "ca" },
  { code: "zh", name: "Chinese (Simplified)", assemblyCode: "zh" },
  { code: "zh-TW", name: "Chinese (Traditional)", assemblyCode: "zh" },
  { code: "hr", name: "Croatian", assemblyCode: "hr" },
  { code: "cs", name: "Czech", assemblyCode: "cs" },
  { code: "da", name: "Danish", assemblyCode: "da" },
  { code: "nl", name: "Dutch", assemblyCode: "nl" },
  { code: "en", name: "English", assemblyCode: "en" },
  { code: "et", name: "Estonian", assemblyCode: "et" },
  { code: "fi", name: "Finnish", assemblyCode: "fi" },
  { code: "fr", name: "French", assemblyCode: "fr" },
  { code: "gl", name: "Galician", assemblyCode: "gl" },
  { code: "ka", name: "Georgian", assemblyCode: "ka" },
  { code: "de", name: "German", assemblyCode: "de" },
  { code: "el", name: "Greek", assemblyCode: "el" },
  { code: "gu", name: "Gujarati", assemblyCode: "gu" },
  { code: "ht", name: "Haitian Creole", assemblyCode: "ht" },
  { code: "he", name: "Hebrew", assemblyCode: "he" },
  { code: "hi", name: "Hindi", assemblyCode: "hi" },
  { code: "hu", name: "Hungarian", assemblyCode: "hu" },
  { code: "is", name: "Icelandic", assemblyCode: "is" },
  { code: "id", name: "Indonesian", assemblyCode: "id" },
  { code: "ga", name: "Irish", assemblyCode: "ga" },
  { code: "it", name: "Italian", assemblyCode: "it" },
  { code: "ja", name: "Japanese", assemblyCode: "ja" },
  { code: "kn", name: "Kannada", assemblyCode: "kn" },
  { code: "kk", name: "Kazakh", assemblyCode: "kk" },
  { code: "ko", name: "Korean", assemblyCode: "ko" },
  { code: "lv", name: "Latvian", assemblyCode: "lv" },
  { code: "lt", name: "Lithuanian", assemblyCode: "lt" },
  { code: "mk", name: "Macedonian", assemblyCode: "mk" },
  { code: "ms", name: "Malay", assemblyCode: "ms" },
  { code: "ml", name: "Malayalam", assemblyCode: "ml" },
  { code: "mt", name: "Maltese", assemblyCode: "mt" },
  { code: "mr", name: "Marathi", assemblyCode: "mr" },
  { code: "mn", name: "Mongolian", assemblyCode: "mn" },
  { code: "ne", name: "Nepali", assemblyCode: "ne" },
  { code: "no", name: "Norwegian", assemblyCode: "no" },
  { code: "ps", name: "Pashto", assemblyCode: "ps" },
  { code: "fa", name: "Persian", assemblyCode: "fa" },
  { code: "pl", name: "Polish", assemblyCode: "pl" },
  { code: "pt", name: "Portuguese", assemblyCode: "pt" },
  { code: "pa", name: "Punjabi", assemblyCode: "pa" },
  { code: "ro", name: "Romanian", assemblyCode: "ro" },
  { code: "ru", name: "Russian", assemblyCode: "ru" },
  { code: "sr", name: "Serbian", assemblyCode: "sr" },
  { code: "si", name: "Sinhala", assemblyCode: "si" },
  { code: "sk", name: "Slovak", assemblyCode: "sk" },
  { code: "sl", name: "Slovenian", assemblyCode: "sl" },
  { code: "so", name: "Somali", assemblyCode: "so" },
  { code: "es", name: "Spanish", assemblyCode: "es" },
  { code: "sw", name: "Swahili", assemblyCode: "sw" },
  { code: "sv", name: "Swedish", assemblyCode: "sv" },
  { code: "tl", name: "Tagalog", assemblyCode: "tl" },
  { code: "ta", name: "Tamil", assemblyCode: "ta" },
  { code: "te", name: "Telugu", assemblyCode: "te" },
  { code: "th", name: "Thai", assemblyCode: "th" },
  { code: "tr", name: "Turkish", assemblyCode: "tr" },
  { code: "uk", name: "Ukrainian", assemblyCode: "uk" },
  { code: "ur", name: "Urdu", assemblyCode: "ur" },
  { code: "uz", name: "Uzbek", assemblyCode: "uz" },
  { code: "vi", name: "Vietnamese", assemblyCode: "vi" },
  { code: "cy", name: "Welsh", assemblyCode: "cy" },
  { code: "yi", name: "Yiddish", assemblyCode: "yi" },
  { code: "yo", name: "Yoruba", assemblyCode: "yo" },
  { code: "zu", name: "Zulu", assemblyCode: "zu" },
]

export async function translateText(text: string, targetLanguage: string, sourceLanguage = "en") {
  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        targetLanguage,
        sourceLanguage,
      }),
    })

    if (!response.ok) {
      throw new Error("Translation failed")
    }

    const data = await response.json()
    return data.translatedText
  } catch (error) {
    console.error("Translation error:", error)
    throw error
  }
}

export function getLanguageName(code: string) {
  const language = languages.find((lang) => lang.code === code || lang.assemblyCode === code)
  return language?.name || code
}
