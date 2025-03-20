"use client"

import { create } from "zustand"
import { generateContentWithAI } from "@/lib/ai"

interface AIState {
  isGenerating: boolean
  error: string | null
  generateContent: (prompt: string) => Promise<string>
}

export const useAIStore = create<AIState>((set) => ({
  isGenerating: false,
  error: null,

  generateContent: async (prompt: string) => {
    set({ isGenerating: true, error: null })
    try {
      const content = await generateContentWithAI(prompt)
      set({ isGenerating: false })
      return content
    } catch (error) {
      console.error("Error generating content:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to generate content",
        isGenerating: false,
      })
      throw error
    }
  },
}))

