import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogIn,
  Plus,
} from "lucide-react";

export const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Tasks",
    href: "/my-tasks",
    icon: ListTodo,
  },
  {
    label: "Workspaces",
    href: "/workspaces",
    icon: FolderKanban,
  },
  {
    label: "Create Workspace",
    href: "/workspaces/create",
    icon: Plus,
  },
  {
    label: "Join Workspace",
    href: "/workspaces/join",
    icon: LogIn,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
] as const;