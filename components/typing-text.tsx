"use client"

import { useEffect, useState } from "react"

interface TypingTextProps {
  text: string
  className?: string
}

export function TypingText({ text, className = "" }: TypingTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 100)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return <span className={`${className} ${currentIndex < text.length ? "typing-animation" : ""}`}>{displayText}</span>
}
