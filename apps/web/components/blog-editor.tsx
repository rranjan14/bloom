"use client";

import type React from "react";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Save, ArrowLeft, MoreHorizontal, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBlogStore } from "@/stores/blog-store";
import type { Blog } from "@/lib/types";
import { EditorToolbar } from "@/components/editor-toolbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { Editor, Extension } from "@tiptap/core";
import { useCallback } from "react";
import debounce from "lodash.debounce";

// Add this custom extension before the BlogEditor component
const CustomKeymap = Extension.create({
  name: "customKeymap",
  addKeyboardShortcuts() {
    return {
      Space: () => this.editor.commands.insertContent(" "),
    };
  },
});

export function BlogEditor({ blogId }: { blogId: string }) {
  const router = useRouter();
  const { blogs, fetchBlogs, updateBlog, deleteBlog } = useBlogStore();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const debouncedUpdate = useCallback(
    debounce((editor: Editor, blog: Blog) => {
      const updatedBlog = {
        ...blog,
        content: editor.getHTML(),
        updatedAt: new Date(),
      };
      updateBlog(updatedBlog);
      setLastSaved(new Date());
    }, 500),
    [updateBlog]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Enable all default keyboard shortcuts
      }),
      Placeholder.configure({
        placeholder: "Start writing your blog post...",
      }),
      CustomKeymap,
    ],
    content: "",
    editable: true,
    autofocus: false,
    onUpdate: ({ editor }) => {
      if (blog) {
        debouncedUpdate(editor, blog);
      }
    },
  });

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    const foundBlog = blogs.find((b) => b.id === blogId);
    if (foundBlog) {
      setBlog(foundBlog);
      setTitle(foundBlog.title);
      if (editor && foundBlog.content) {
        editor.commands.setContent(foundBlog.content);
      }
      setLastSaved(new Date(foundBlog.updatedAt));
    }
  }, [blogs, blogId, editor]);

  useEffect(() => {
    // Focus the title input when the component mounts
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (blog) {
      const updatedBlog = {
        ...blog,
        title: e.target.value,
        updatedAt: new Date(),
      };
      updateBlog(updatedBlog);
      setLastSaved(new Date());
    }
  };

  const handleSave = async () => {
    if (blog && editor) {
      setIsSaving(true);
      try {
        await updateBlog({
          ...blog,
          title,
          content: editor.getHTML(),
          updatedAt: new Date(),
        });
        setLastSaved(new Date());
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!blog) return;

    await deleteBlog(blog.id);
    router.push("/");
  };

  const handleBack = () => {
    router.back();
  };

  if (!blog) {
    return <div className="container mx-auto p-6">Loading blog...</div>;
  }

  return (
    <div className="h-screen overflow-hidden p-4 flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-primary-a30">
            {lastSaved && (
              <>
                <Clock className="h-3 w-3 mr-1" />
                <span>Last saved {formatDate(lastSaved)}</span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  Delete Blog
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="mb-8 flex-shrink-0">
        <Input
          ref={titleRef}
          value={title}
          onChange={handleTitleChange}
          placeholder="Blog Title"
          className="text-4xl text-primary-a0 font-medium border-sm shadow-none focus-visible:ring-0 px-2 h-auto mb-2 bg-surface-a0 border-surface-a10 placeholder-surface-a50"
        />
        <div className="flex items-center text-sm text-primary-a30">
          <User className="h-3 w-3 mr-1" />
          <span>You</span>
          <span className="mx-2">•</span>
          <Clock className="h-3 w-3 mr-1" />
          <span>Created {formatDate(blog.createdAt)}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <div className="h-full border rounded-lg shadow-sm border-surface-tonal-a10 bg-surface-tonal-a10 overflow-hidden flex flex-col">
          <EditorToolbar editor={editor} />
          <Separator className="flex-shrink-0" />
          <EditorContent
            editor={editor}
            className="prose max-w-none flex-1 overflow-auto"
          />
        </div>
      </div>
    </div>
  );
}
