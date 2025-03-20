"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Calendar,
  Grid,
  List,
  MoreHorizontal,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useBlogStore } from "@/stores/blog-store";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Draggable Blog Card Component
function DraggableBlogCard({ blog }: { blog: any; workspaces: any[] }) {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: blog.id,
    data: {
      type: "blog",
      blog,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:shadow-md transition-shadow border-surface-a10 bg-surface-a10 h-[16rem] flex flex-col"
      onClick={() => router.push(`/blog/${blog.id}`)}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="flex-none">
        <CardTitle className="truncate text-lg text-primary-a10">
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
  );
}

// Droppable Workspace Card
function DroppableWorkspaceCard({
  workspace,
  isOver,
}: {
  workspace: any;
  isOver: boolean;
}) {
  const router = useRouter();

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow border-surface-a10 bg-surface-a10 h-[280px] flex flex-col ${isOver ? "ring-2 ring-primary-a10" : ""}`}
      onClick={() => router.push(`/workspace/${workspace.id}`)}
    >
      <CardHeader>
        <CardTitle className="truncate text-primary-a30">
          {workspace.name}
        </CardTitle>
        <CardDescription>
          Created: {formatDate(workspace.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {workspace.description || "No description"}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-primary-a30"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/workspace/${workspace.id}`);
          }}
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
}

export function Dashboard() {
  const router = useRouter();
  const { workspaces, fetchWorkspaces, createWorkspace } = useWorkspaceStore();
  const { blogs, fetchBlogs, createBlog, updateBlog } = useBlogStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeBlog, setActiveBlog] = useState<any | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchWorkspaces();
    fetchBlogs();
  }, [fetchWorkspaces, fetchBlogs]);

  const handleCreateWorkspace = async () => {
    const workspace = await createWorkspace({
      name: "New Workspace",
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    router.push(`/workspace/${workspace.id}`);
  };

  const handleCreateBlog = async () => {
    const blog = await createBlog({
      title: "Untitled Blog",
      content: "",
      workspaceId: "default",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    router.push(`/blog/${blog.id}`);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    if (active.data.current?.type === "blog") {
      setActiveBlog(active.data.current.blog);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // If we're dropping onto a workspace
      if (
        over.data.current?.type === "workspace" &&
        active.data.current?.type === "blog"
      ) {
        const blog = active.data.current.blog;
        const workspaceId = over.id as string;

        // Update the blog's workspace
        await updateBlog({
          ...blog,
          workspaceId,
          updatedAt: new Date(),
        });
      }
    }

    setActiveId(null);
    setActiveBlog(null);
    setActiveWorkspace(null);
  };

  // Group blogs by date
  const groupedBlogs = blogs.reduce(
    (acc, blog) => {
      const date = new Date(blog.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(blog);
      return acc;
    },
    {} as Record<string, typeof blogs>
  );

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedBlogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.content &&
        blog.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inbox</h1>
          <div className="flex gap-2">
            <Button onClick={handleCreateBlog}>
              <Plus className="h-4 w-4" />
              New Blog
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 gap-2">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search blogs..."
              className="bg-surface-a0 border-surface-a10 rounded-full placeholder-surface-a50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-surface-a10 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary-a10 data-[state=active]:text-white text-surface-a50 data-[state=active]:rounded-md"
            >
              All Blogs
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="data-[state=active]:bg-primary-a10 data-[state=active]:text-white text-surface-a50 data-[state=active]:rounded-md"
            >
              Recent
            </TabsTrigger>
            <TabsTrigger
              value="workspaces"
              className="data-[state=active]:bg-primary-a10 data-[state=active]:text-white text-surface-a50 data-[state=active]:rounded-md"
            >
              Workspaces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {searchQuery ? (
              <div className="grid grid-cols-1 gap-4">
                <h2 className="text-lg font-medium mb-2">Search Results</h2>
                {filteredBlogs.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        : "grid grid-cols-1 gap-4"
                    }
                  >
                    <SortableContext
                      items={filteredBlogs.map((blog) => blog.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {filteredBlogs.map((blog) => (
                        <DraggableBlogCard
                          key={blog.id}
                          blog={blog}
                          workspaces={workspaces}
                        />
                      ))}
                    </SortableContext>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <p className="text-muted-foreground mb-4">
                        No blogs found matching "{searchQuery}"
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {sortedDates.map((date) => (
                  <div key={date}>
                    <div className="flex items-center mb-4">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h2 className="text-lg font-medium">{date}</h2>
                    </div>
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                          : "grid grid-cols-1 gap-4"
                      }
                    >
                      <SortableContext
                        items={groupedBlogs[date].map((blog) => blog.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {groupedBlogs[date].map((blog) => (
                          <DraggableBlogCard
                            key={blog.id}
                            blog={blog}
                            workspaces={workspaces}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SortableContext
                items={blogs.slice(0, 6).map((blog) => blog.id)}
                strategy={verticalListSortingStrategy}
              >
                {blogs.slice(0, 6).map((blog) => (
                  <DraggableBlogCard
                    key={blog.id}
                    blog={blog}
                    workspaces={workspaces}
                  />
                ))}
              </SortableContext>
            </div>
          </TabsContent>

          <TabsContent value="workspaces">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  data-type="workspace"
                  data-id={workspace.id}
                >
                  <DroppableWorkspaceCard
                    workspace={workspace}
                    isOver={
                      activeId !== null && activeWorkspace === workspace.id
                    }
                  />
                </div>
              ))}
              <Card
                className="border-dashed cursor-pointer border-[hsl(var(--border))]"
                onClick={handleCreateWorkspace}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-6">
                  <Plus className="h-8 w-8 mb-2 text-primary-a30" />
                  <p className="text-primary-a30">Create new workspace</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DragOverlay>
        {activeBlog ? (
          <Card className="cursor-grabbing shadow-lg border-[hsl(var(--border))] w-80">
            <CardHeader className="pb-2">
              <CardTitle className="truncate text-lg">
                {activeBlog.title}
              </CardTitle>
              <CardDescription>
                Last updated: {formatDate(activeBlog.updatedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {activeBlog.content
                  ? activeBlog.content.replace(/<[^>]*>/g, "")
                  : "No content yet"}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
