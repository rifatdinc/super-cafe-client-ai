"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ChevronLeft } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils"

const sidebarVariants = cva(
  "bg-background relative flex flex-col gap-4 border-r pb-4 data-[collapsible=icon]:transition-[width] data-[collapsible=icon]:ease-linear group/sidebar-wrapper",
  {
    variants: {
      collapsible: {
        icon: "w-64 data-[state=collapsed]:w-14",
      },
    },
  }
)

interface SidebarContextValue {
  isMobile: boolean
  isCollapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  onClose?: () => void
}

const SidebarContext = React.createContext<SidebarContextValue>({
  isMobile: false,
  isCollapsed: false,
  setCollapsed: () => null,
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setCollapsed] = React.useState(false)
  const isMobile = false // You might want to use a proper hook for this

  return (
    <SidebarContext.Provider
      value={{
        isMobile,
        isCollapsed,
        setCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

export function Sidebar({
  className,
  collapsible,
  ...props
}: SidebarProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div
      className={cn(sidebarVariants({ collapsible }), className)}
      data-state={isCollapsed ? "collapsed" : "expanded"}
      {...props}
    />
  )
}

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-4 py-2", className)}
      {...props}
    />
  )
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-1 flex-col gap-2 overflow-y-auto", className)}
      {...props}
    />
  )
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-auto px-4", className)}
      {...props}
    />
  )
}

export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 px-4", className)}
      {...props}
    />
  )
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-2 flex flex-col gap-1", className)}
      {...props}
    />
  )
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative", className)}
      {...props}
    />
  )
}

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "default" | "lg"
  tooltip?: string
  asChild?: boolean
}

export function SidebarMenuButton({
  className,
  size = "default",
  tooltip,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "group/button relative flex w-full items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        size === "default" && "h-9",
        size === "lg" && "h-14",
        className
      )}
      {...props}
    />
  )
}

export function SidebarMenuSub({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 py-1.5", className)}
      {...props}
    />
  )
}

export function SidebarMenuSubItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative", className)}
      {...props}
    />
  )
}

interface SidebarMenuSubButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function SidebarMenuSubButton({
  className,
  asChild = false,
  ...props
}: SidebarMenuSubButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "group/button relative flex h-9 w-full items-center gap-2 rounded-lg px-8 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export function SidebarMenuAction({
  className,
  showOnHover,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  showOnHover?: boolean
}) {
  return (
    <button
      className={cn(
        "absolute right-2 z-20 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/80 opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        showOnHover && "group-hover/button:opacity-100 opacity-0",
        className
      )}
      {...props}
    />
  )
}

export function SidebarRail({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { setCollapsed, isCollapsed } = useSidebar()
  
  return (
    <div
      className={cn(
        "absolute inset-y-0 right-0 w-[1px] bg-border cursor-col-resize hover:bg-accent/50 transition-colors",
        className
      )}
      onClick={() => setCollapsed(!isCollapsed)}
      {...props}
    />
  )
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarInset({
  className,
  ...props
}: SidebarInsetProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div
      className={cn(
        "flex flex-1 flex-col transition-[margin] ease-linear",
        isCollapsed ? "ml-14" : "ml-64",
        className
      )}
      {...props}
    />
  )
}

interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({
  className,
  ...props
}: SidebarTriggerProps) {
  const { setCollapsed, isCollapsed } = useSidebar()

  return (
    <button
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={() => setCollapsed(!isCollapsed)}
      {...props}
    >
      <ChevronLeft 
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          isCollapsed ? "rotate-180" : ""
        )} 
      />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}
