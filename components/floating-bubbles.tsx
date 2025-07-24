"use client"

import { useEffect, useState } from "react"

export function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<
    Array<{
      id: number
      size: number
      left: number
      top: number
      delay: number
    }>
  >([])

  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles = []
      for (let i = 0; i < 15; i++) {
        newBubbles.push({
          id: i,
          size: Math.random() * 100 + 20,
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 6,
        })
      }
      setBubbles(newBubbles)
    }

    generateBubbles()
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            top: `${bubble.top}%`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
