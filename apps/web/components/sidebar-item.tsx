import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  icon: Icon,
  label,
  isCollapsed,
  isActive,
  onClick,
}: SidebarItemProps) {
  return (
    <div
      className={cn(
        "flex items-center px-3 py-2 rounded-md transition-colors gap-2",
        isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
        isCollapsed && "justify-center"
      )}
      onClick={onClick}
    >
      <Icon
        className={cn(
          "h-5 w-5 justify-center items-center",
          "transition-all",
          isActive && "text-primary"
        )}
      />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </div>
  );
}
