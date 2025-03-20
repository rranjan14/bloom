"use client";

import React, { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Strikethrough,
  Sparkles,
  Wand2,
  Lightbulb,
  MessageSquare,
  Zap,
  Loader2,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAIStore } from "@/stores/ai-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiPopoverOpen, setIsAiPopoverOpen] = useState(false);
  const { isGenerating, generateContent } = useAIStore();

  if (!editor) {
    return null;
  }

  const handleAiAction = async (action: string) => {
    if (!editor) return;

    const selection = editor.state.selection;
    const selectedText = selection.empty
      ? ""
      : editor.state.doc.textBetween(selection.from, selection.to);

    try {
      let prompt = "";
      let content = "";

      switch (action) {
        case "generate-outline":
          prompt =
            "Generate an outline for a blog post about: " +
            (editor.getText() || "the current topic");
          content = await generateContent(prompt);
          editor.commands.insertContent(content);
          break;
        case "expand":
          if (!selectedText) {
            alert("Please select text to expand");
            return;
          }
          prompt = `Expand on this text: ${selectedText}`;
          content = await generateContent(prompt);
          editor.commands.insertContentAt(selection, content);
          break;
        case "improve":
          if (!selectedText) {
            alert("Please select text to improve");
            return;
          }
          prompt = `Improve this text and make it more engaging: ${selectedText}`;
          content = await generateContent(prompt);
          editor.commands.insertContentAt(selection, content);
          break;
        case "summarize":
          prompt = `Summarize this text into a concise paragraph: ${editor.getText()}`;
          content = await generateContent(prompt);
          editor.commands.insertContent("<h2>Summary</h2>" + content);
          break;
        case "conclusion":
          prompt = `Write a compelling conclusion for this blog post: ${editor.getText()}`;
          content = await generateContent(prompt);
          editor.commands.insertContent("<h2>Conclusion</h2>" + content);
          break;
        case "custom":
          if (!aiPrompt) {
            alert("Please enter a prompt");
            return;
          }
          content = await generateContent(aiPrompt);
          editor.commands.insertContentAt(selection, content);
          setAiPrompt("");
          setIsAiPopoverOpen(false);
          break;
        case "custom":
          if (!aiPrompt) {
            alert("Please enter a prompt");
            return;
          }
          content = await generateContent(aiPrompt);
          editor.commands.insertContent(content);
          setAiPrompt("");
          setIsAiPopoverOpen(false);
          break;
      }
    } catch (error) {
      console.error("Error with AI action:", error);
    }
  };

  return (
    <div className="p-2 flex flex-wrap gap-1 items-center bg-muted/20">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-sm">
            Normal Text
            <span className="sr-only">Select heading</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            Normal Text
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("codeBlock")}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Code Block"
      >
        <Code className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <AlignLeft className="h-4 w-4" />
            <span className="sr-only">Text alignment</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem>
            <AlignLeft className="h-4 w-4 mr-2" />
            <span>Align left</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <AlignCenter className="h-4 w-4 mr-2" />
            <span>Align center</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <AlignRight className="h-4 w-4 mr-2" />
            <span>Align right</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <AlignJustify className="h-4 w-4 mr-2" />
            <span>Justify</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Link className="h-4 w-4" />
        <span className="sr-only">Insert link</span>
      </Button>

      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Image className="h-4 w-4" />
        <span className="sr-only">Insert image</span>
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* AI Features */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-sm">
            <Sparkles className="h-4 w-4 mr-1" />
            AI Assist
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleAiAction("generate-outline")}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Generate Outline
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAiAction("expand")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Expand Selection
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAiAction("improve")}>
            <Wand2 className="h-4 w-4 mr-2" />
            Improve Selection
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAiAction("summarize")}>
            <Zap className="h-4 w-4 mr-2" />
            Generate Summary
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAiAction("conclusion")}>
            <Sparkles className="h-4 w-4 mr-2" />
            Write Conclusion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={isAiPopoverOpen} onOpenChange={setIsAiPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-sm">
            <Wand2 className="h-4 w-4 mr-1" />
            Custom AI
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Ask AI to generate content</Label>
              <Textarea
                id="ai-prompt"
                placeholder="E.g., Write an introduction about climate change..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => handleAiAction("custom")}
              disabled={isGenerating || !aiPrompt}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1"></div>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
        <span className="sr-only">Undo</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
        <span className="sr-only">Redo</span>
      </Button>
    </div>
  );
}
