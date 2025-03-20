"use client"

import { create } from "zustand"
import type { Workspace } from "@/lib/types"
import {
  getWorkspaces,
  getWorkspace,
  addWorkspace,
  updateWorkspace as updateWorkspaceInDB,
  deleteWorkspace as deleteWorkspaceInDB,
} from "@/lib/db"

interface WorkspaceState {
  workspaces: Workspace[]
  isLoading: boolean
  error: string | null
  fetchWorkspaces: () => Promise<void>
  getWorkspace: (id: string) => Promise<Workspace | undefined>
  createWorkspace: (workspace: Omit<Workspace, "id">) => Promise<Workspace>
  updateWorkspace: (workspace: Workspace) => Promise<Workspace>
  deleteWorkspace: (id: string) => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null })
    try {
      const workspaces = await getWorkspaces()
      set({ workspaces, isLoading: false })
    } catch (error) {
      console.error("Error fetching workspaces:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to fetch workspaces",
        isLoading: false,
      })
    }
  },

  getWorkspace: async (id: string) => {
    try {
      return await getWorkspace(id)
    } catch (error) {
      console.error(`Error fetching workspace ${id}:`, error)
      set({
        error: error instanceof Error ? error.message : `Failed to fetch workspace ${id}`,
      })
      return undefined
    }
  },

  createWorkspace: async (workspace: Omit<Workspace, "id">) => {
    set({ isLoading: true, error: null })
    try {
      const newWorkspace = await addWorkspace(workspace)
      set((state) => ({
        workspaces: [...state.workspaces, newWorkspace],
        isLoading: false,
      }))
      return newWorkspace
    } catch (error) {
      console.error("Error creating workspace:", error)
      set({
        error: error instanceof Error ? error.message : "Failed to create workspace",
        isLoading: false,
      })
      throw error
    }
  },

  updateWorkspace: async (workspace: Workspace) => {
    set({ isLoading: true, error: null })
    try {
      const updatedWorkspace = await updateWorkspaceInDB(workspace)
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w.id === updatedWorkspace.id ? updatedWorkspace : w)),
        isLoading: false,
      }))
      return updatedWorkspace
    } catch (error) {
      console.error(`Error updating workspace ${workspace.id}:`, error)
      set({
        error: error instanceof Error ? error.message : `Failed to update workspace ${workspace.id}`,
        isLoading: false,
      })
      throw error
    }
  },

  deleteWorkspace: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await deleteWorkspaceInDB(id)
      set((state) => ({
        workspaces: state.workspaces.filter((w) => w.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      console.error(`Error deleting workspace ${id}:`, error)
      set({
        error: error instanceof Error ? error.message : `Failed to delete workspace ${id}`,
        isLoading: false,
      })
      throw error
    }
  },
}))

