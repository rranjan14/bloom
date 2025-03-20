import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    // Parse the request body
    const body = await request.json()
    const { prompt, model = "gpt-4o", system } = body

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Generate content using AI SDK
    const response = await generateText({
      model: openai(model),
      prompt,
      system: system || "You are a helpful writing assistant. Provide clear, concise, and well-structured content.",
    })

    return NextResponse.json({ content: response.text })
  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
  }
}

