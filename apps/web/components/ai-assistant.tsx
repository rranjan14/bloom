"use client"

import { useState } from "react"
import type { Editor } from "@tiptap/react"
import { Sparkles, X, Send, Lightbulb, MessageSquare, Zap, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAIStore } from "@/stores/ai-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AIAssistantProps {
  editor: Editor | null
  onClose: () => void
}

export function AIAssistant({ editor, onClose }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { generateContent } = useAIStore()

  const handleGenerateContent = async () => {
    if (!editor || !prompt) return

    setIsLoading(true)
    try {
      const content = await generateContent(prompt)
      editor.commands.insertContent(content)
      setPrompt("")
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    if (!editor) return

    const selection = editor.state.selection
    const selectedText = selection.empty ? "" : editor.state.doc.textBetween(selection.from, selection.to)

    setIsLoading(true)
    try {
      let prompt = ""
      let content = ""

      switch (action) {
        case "generate-outline":
          prompt = "Generate an outline for a blog post about: " + (editor.getText() || "the current topic")
          content = await generateContent(prompt)
          editor.commands.insertContent(content)
          break
        case "expand":
          if (!selectedText) {
            alert("Please select text to expand")
            return
          }
          prompt = `Expand on this text: ${selectedText}`
          content = await generateContent(prompt)
          editor.commands.insertContentAt(selection, content)
          break
        case "improve":
          if (!selectedText) {
            alert("Please select text to improve")
            return
          }
          prompt = `Improve this text and make it more engaging: ${selectedText}`
          content = await generateContent(prompt)
          editor.commands.insertContentAt(selection, content)
          break
        case "summarize":
          prompt = `Summarize this text into a concise paragraph: ${editor.getText()}`
          content = await generateContent(prompt)
          editor.commands.insertContent("<h2>Summary</h2>" + content)
          break
        case "conclusion":
          prompt = `Write a compelling conclusion for this blog post: ${editor.getText()}`
          content = await generateContent(prompt)
          editor.commands.insertContent("<h2>Conclusion</h2>" + content)
          break
      }
    } catch (error) {
      console.error("Error with AI action:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          AI Assistant
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quick-actions">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
            <TabsTrigger value="custom-prompt">Custom Prompt</TabsTrigger>
          </TabsList>

          <TabsContent value="quick-actions">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleQuickAction("generate-outline")}
                disabled={isLoading}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Outline
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleQuickAction("expand")}
                disabled={isLoading}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Expand Selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleQuickAction("improve")}
                disabled={isLoading}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Improve Selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleQuickAction("summarize")}
                disabled={isLoading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Generate Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => handleQuickAction("conclusion")}
                disabled={isLoading}
                className="col-span-2"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Write Conclusion
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="custom-prompt">
            <div className="flex flex-col gap-2">
              <Textarea
                placeholder="Ask AI to generate content..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="resize-none min-h-[100px]"
              />
              <Button className="self-end" onClick={handleGenerateContent} disabled={isLoading || !prompt}>
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Generate
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        AI-generated content may require editing for accuracy and style.
      </CardFooter>
    </Card>
  )
}

