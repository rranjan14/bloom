import { openDB, type DBSchema, type IDBPDatabase } from "idb"
import type { Blog, Workspace } from "./types"
import { generateMultipleBlogs } from "./ai"

interface BlogDB extends DBSchema {
  workspaces: {
    key: string
    value: Workspace
    indexes: { "by-name": string }
  }
  blogs: {
    key: string
    value: Blog
    indexes: { "by-workspace": string }
  }
}

const DB_NAME = "blog-writer-db"
const DB_VERSION = 1

let dbInitialized = false
let db: IDBPDatabase<BlogDB> | null = null

export async function initializeDatabase(): Promise<IDBPDatabase<BlogDB>> {
  if (db) return db

  db = await openDB<BlogDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Create workspaces store
      const workspacesStore = database.createObjectStore("workspaces", {
        keyPath: "id",
      })
      workspacesStore.createIndex("by-name", "name")

      // Create blogs store
      const blogsStore = database.createObjectStore("blogs", {
        keyPath: "id",
      })
      blogsStore.createIndex("by-workspace", "workspaceId")

      // Create default workspace
      const defaultWorkspace: Workspace = {
        id: "default",
        name: "Default Workspace",
        description: "Your default workspace",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      workspacesStore.put(defaultWorkspace)
    },
  })

  // Only add blogs once during the first initialization
  if (!dbInitialized) {
    const blogsCount = (await db.getAll("blogs")).length
    if (blogsCount === 0) {
      const randomBlogs = await generateMultipleBlogs(2)
      const tx = db.transaction("blogs", "readwrite")
      try {
        for (const blog of randomBlogs.slice(0, 2)) {
          const newBlog = {
            id: crypto.randomUUID(),
            title: blog.title,
            content: blog.content,
            workspaceId: "default",
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          await tx.store.put(newBlog)
        }
        await tx.done
      } catch (error) {
        console.error("Error adding initial blogs:", error)
        tx.abort()
      }
    }
    dbInitialized = true
  }

  return db
}

// Workspace operations
export async function getWorkspaces(): Promise<Workspace[]> {
  const database = await initializeDatabase()
  return database.getAll("workspaces")
}

export async function getWorkspace(id: string): Promise<Workspace | undefined> {
  const database = await initializeDatabase()
  return database.get("workspaces", id)
}

export async function addWorkspace(workspace: Omit<Workspace, "id">): Promise<Workspace> {
  const database = await initializeDatabase()
  const id = crypto.randomUUID()
  const newWorkspace: Workspace = { ...workspace, id }
  await database.put("workspaces", newWorkspace)
  return newWorkspace
}

export async function updateWorkspace(workspace: Workspace): Promise<Workspace> {
  const database = await initializeDatabase()
  await database.put("workspaces", workspace)
  return workspace
}

export async function deleteWorkspace(id: string): Promise<void> {
  const database = await initializeDatabase()
  await database.delete("workspaces", id)

  // Delete all blogs in this workspace or move them to default
  const blogsInWorkspace = await database.getAllFromIndex("blogs", "by-workspace", id)
  const tx = database.transaction("blogs", "readwrite")

  for (const blog of blogsInWorkspace) {
    // Option 1: Delete blogs
    // await tx.store.delete(blog.id);

    // Option 2: Move to default workspace
    await tx.store.put({
      ...blog,
      workspaceId: "default",
      updatedAt: new Date(),
    })
  }

  await tx.done
}

// Blog operations
export async function getBlogs(): Promise<Blog[]> {
  const database = await initializeDatabase()
  return database.getAll("blogs")
}

export async function getBlogsByWorkspace(workspaceId: string): Promise<Blog[]> {
  const database = await initializeDatabase()
  return database.getAllFromIndex("blogs", "by-workspace", workspaceId)
}

export async function getBlog(id: string): Promise<Blog | undefined> {
  const database = await initializeDatabase()
  return database.get("blogs", id)
}

export async function addBlog(blog: Omit<Blog, "id">): Promise<Blog> {
  const database = await initializeDatabase()
  const id = crypto.randomUUID()
  const newBlog: Blog = { ...blog, id }
  await database.put("blogs", newBlog)
  return newBlog
}

export async function updateBlog(blog: Blog): Promise<Blog> {
  const database = await initializeDatabase()
  await database.put("blogs", blog)
  return blog
}

export async function deleteBlog(id: string): Promise<void> {
  const database = await initializeDatabase()
  await database.delete("blogs", id)
}

