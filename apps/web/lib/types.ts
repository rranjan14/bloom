export interface Workspace {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Blog {
  id: string
  title: string
  content: string
  workspaceId: string
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

export interface AIProvider {
  id: string
  name: string
  apiKey?: string
  model?: string
}

