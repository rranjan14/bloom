export async function generateContentWithAI(prompt: string, system?: string): Promise<string> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        system,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to generate content")
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error("Error generating content with AI:", error)
    throw new Error("Failed to generate content")
  }
}

