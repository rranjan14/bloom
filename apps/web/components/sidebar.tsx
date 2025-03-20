"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Plus,
  Home,
  FolderOpen,
  PenTool,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useBlogStore } from "@/stores/blog-store";
import type { Workspace } from "@/lib/types";
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SidebarItem } from "@/components/sidebar-item";
import { useUIStore } from "@/stores/ui-store";

// Add this type and array before the Sidebar component
interface SidebarNavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

const sidebarItems: SidebarNavItem[] = [
  {
    icon: Home,
    label: "Inbox",
    href: "/",
  },
];

// Add this component before the main Sidebar component
interface CollapseButtonProps {
  collapsed: boolean;
  onClick: () => void;
}

function CollapseButton({ collapsed, onClick }: CollapseButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-md border-surface-a20 shadow-sm bg-surface-a20 z-10"
      onClick={onClick}
    >
      {collapsed ? (
        <ChevronRight className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <ChevronLeft className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Button>
  );
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { workspaces, fetchWorkspaces, createWorkspace } = useWorkspaceStore();
  const { createBlog } = useBlogStore();
  const { isSidebarCollapsed: collapsed, toggleSidebar } = useUIStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
    description: "",
  });

  // Add this new function
  const handleCreateWorkspaceWithModal = async () => {
    const workspace = await createWorkspace({
      name: newWorkspace.name || "New Workspace",
      description: newWorkspace.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setShowCreateModal(false);
    setNewWorkspace({ name: "", description: "" });
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

  return (
    <div className="relative h-screen">
      <UISidebar
        className={cn(
          "border-r border-surface-a10 bg-surface-a10 transition-all duration-200",
          collapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        <SidebarHeader className="p-4">
          <div className="flex flex-row justify-between gap-2">
            <div className="flex flex-row items-center justify-start gap-2">
              <PenTool className="h-6 w-6 text-primary-a0" />
              {!collapsed && (
                <h1 className="text-xl font-bold text-primary-a10">Bloom</h1>
              )}
            </div>
            <div className="flex flex-row items-end justify-end">
              {!collapsed && (
                <CollapseButton collapsed={collapsed} onClick={toggleSidebar} />
              )}
            </div>
          </div>
          {!collapsed ? (
            <div className="flex gap-2 mt-4">
              <Button className="w-full" onClick={handleCreateBlog}>
                <Plus className="h-4 w-4" />
                New Blog
              </Button>
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <Button size="icon" onClick={handleCreateBlog}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </SidebarHeader>
        <SidebarSeparator />
        {!collapsed && (
          <div className="px-4 py-2">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search for blog..."
                className="bg-surface-a0 border-surface-a10 rounded-full placeholder-surface-a50"
              />
            </div>
          </div>
        )}
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    onClick={() => router.push(item.href)}
                  >
                    <SidebarItem
                      icon={item.icon}
                      label={item.label}
                      isCollapsed={collapsed}
                      isActive={pathname === item.href}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="flex justify-between items-center">
                <span className="text-lg font-normal">Workspaces</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={handleCreateWorkspaceWithModal}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {workspaces.map((workspace: Workspace) => (
                  <SidebarMenuItem key={workspace.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === `/workspace/${workspace.id}`}
                      onClick={() => router.push(`/workspace/${workspace.id}`)}
                    >
                      <SidebarItem
                        icon={FolderOpen}
                        label={workspace.name}
                        isCollapsed={collapsed}
                        isActive={pathname === `/workspace/${workspace.id}`}
                      />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                {collapsed && (
                  <CollapseButton
                    collapsed={collapsed}
                    onClick={toggleSidebar}
                  />
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="mt-4 flex justify-end">
            <ModeToggle />
          </div>
        </SidebarFooter>
      </UISidebar>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary-a30">
              Create New Workspace
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Workspace name"
                value={newWorkspace.name}
                onChange={(e) =>
                  setNewWorkspace((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Workspace description"
                value={newWorkspace.description}
                onChange={(e) =>
                  setNewWorkspace((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspaceWithModal}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update the button click handler */}
      {collapsed && (
        <div className="flex justify-center mt-4">
          <Button size="icon" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center mt-4">
          <Button size="icon" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
