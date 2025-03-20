"use client";

import type React from "react";

import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useEffect } from "react";
import { initializeDatabase } from "@/lib/db";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex w-screen h-screen">
        <Sidebar />
        <main
          className={cn(
            "flex-1 w-full overflow-auto transition-all duration-200"
          )}
        >
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
