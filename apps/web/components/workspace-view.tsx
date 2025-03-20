"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useBlogStore } from "@/stores/blog-store";
import { formatDate } from "@/lib/utils";
import type { Workspace } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspaceView({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const { workspaces, fetchWorkspaces, updateWorkspace, deleteWorkspace } =
    useWorkspaceStore();
  const { blogs, fetchBlogs, createBlog } = useBlogStore();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  useEffect(() => {
    fetchWorkspaces();
    fetchBlogs();
  }, [fetchWorkspaces, fetchBlogs]);

  useEffect(() => {
    const foundWorkspace = workspaces.find((w) => w.id === workspaceId);
    if (foundWorkspace) {
      setWorkspace(foundWorkspace);
      setEditedName(foundWorkspace.name);
      setEditedDescription(foundWorkspace.description || "");
    }
  }, [workspaces, workspaceId]);

  const workspaceBlogs = blogs.filter(
    (blog) => blog.workspaceId === workspaceId
  );

  const handleCreateBlog = async () => {
    if (!workspace) return;

    const blog = await createBlog({
      title: "Untitled Blog",
      content: "",
      workspaceId: workspace.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    router.push(`/blog/${blog.id}`);
  };

  const handleSaveWorkspace = async () => {
    if (!workspace) return;

    await updateWorkspace({
      ...workspace,
      name: editedName,
      description: editedDescription,
      updatedAt: new Date(),
    });

    setIsEditing(false);
  };

  const handleDeleteWorkspace = async () => {
    if (!workspace) return;

    await deleteWorkspace(workspace.id);
    router.push("/");
  };

  if (!workspace) {
    return <div className="container mx-auto p-6">Loading workspace...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        {isEditing ? (
          <div className="flex-1 mr-4">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="text-2xl font-medium mb-2"
            />
            <Textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Workspace description"
              className="resize-none"
            />
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-normal text-primary-a20">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-muted-foreground mt-2">
                {workspace.description}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSaveWorkspace}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCreateBlog}>
                <Plus className="h-4 w-4 mr-2" />
                New Blog
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Workspace
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red"
                    onClick={handleDeleteWorkspace}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-xl mb-4">Blogs in this Workspace</h2>
        {workspaceBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaceBlogs.map((blog) => (
              <Card
                key={blog.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-surface-a10 bg-surface-a10 h-[16rem] flex flex-col"
                onClick={() => router.push(`/blog/${blog.id}`)}
              >
                <CardHeader className="flex-none">
                  <CardTitle className="truncate text-primary-a30">
                    {blog.title}
                  </CardTitle>
                  <CardDescription>
                    Last updated: {formatDate(blog.updatedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {blog.content
                      ? blog.content.replace(/<[^>]*>/g, "")
                      : "No content yet"}
                  </p>
                </CardContent>
                <CardFooter className="flex-none">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-primary-a30"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/blog/${blog.id}`);
                    }}
                  >
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-muted-foreground mb-4">
                No blogs in this workspace yet
              </p>
              <Button onClick={handleCreateBlog}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first blog
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
