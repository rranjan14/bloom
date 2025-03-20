"use client"

import { create } from "zustand"
import type { Blog } from "@/lib/types"
import {
  getBlogs,
  getBlogsByWorkspace,
  getBlog,
  addBlog,
  updateBlog as updateBlogInDB,
  deleteBlog as deleteBlogInDB,
} from "@/lib/db"

interface BlogState {
  blogs: Blog[]
  isLoading: boolean
  error: string | null
  fetchBlogs: () => Promise<void>
  fetchBlogsByWorkspace: (workspaceId: string) => Promise<void>
  getBlog: (id: string) => Promise<Blog | undefined>
  createBlog: (blog: Omit<Blog, "id">) => Promise<Blog>
  updateBlog: (blog: Blog) => Promise<Blog>
  deleteBlog: (id: string) => Promise<void>
}

export const useBlogStore = create<BlogState>((set, get) => ({
  blogs: [],
  isLoading: false,
  error: null,

  fetchBlogs: async () => {
    set({ isLoading: true, error: null })
    try {
      const blogs = await getBlogs()
      set({ blogs, isLoading: false })
    } catch (error) {
      console.error("Error fetching blogs:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to fetch blogs",
        isLoading: false,
      })
    }
  },

  fetchBlogsByWorkspace: async (workspaceId: string) => {
    set({ isLoading: true, error: null })
    try {
      const blogs = await getBlogsByWorkspace(workspaceId)
      set({ blogs, isLoading: false })
    } catch (error) {
      console.error(`Error fetching blogs for workspace ${workspaceId}:`, error)
      set({
        error: error instanceof Error ? error.message : `Failed to fetch blogs for workspace ${workspaceId}`,
        isLoading: false,
      })
    }
  },

  getBlog: async (id: string) => {
    try {
      return await getBlog(id)
    } catch (error) {
      console.error(`Error fetching blog ${id}:`, error)
      set({
        error: error instanceof Error ? error.message : `Failed to fetch blog ${id}`,
      })
      return undefined
    }
  },

  createBlog: async (blog: Omit<Blog, "id">) => {
    set({ isLoading: true, error: null })
    try {
      const newBlog = await addBlog(blog)
      set((state) => ({
        blogs: [...state.blogs, newBlog],
        isLoading: false,
      }))
      return newBlog
    } catch (error) {
      console.error("Error creating blog:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to create blog",
        isLoading: false,
      })
      throw error
    }
  },

  updateBlog: async (blog: Blog) => {
    set({ isLoading: true, error: null })
    try {
      const updatedBlog = await updateBlogInDB(blog)
      set((state) => ({
        blogs: state.blogs.map((b) => (b.id === updatedBlog.id ? updatedBlog : b)),
        isLoading: false,
      }))
      return updatedBlog
    } catch (error) {
      console.error(`Error updating blog ${blog.id}:`, error)
      set({
        error: error instanceof Error ? error.message : `Failed to update blog ${blog.id}`,
        isLoading: false,
      })
      throw error
    }
  },

  deleteBlog: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deleteBlogInDB(id)
      set((state) => ({
        blogs: state.blogs.filter((b) => b.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      console.error(`Error deleting blog ${id}:`, error)
      set({
        error: error instanceof Error ? error.message : `Failed to delete blog ${id}`,
        isLoading: false,
      })
      throw error
    }
  },
}))

