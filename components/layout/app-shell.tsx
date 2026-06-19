'use client'

import { Sidebar } from './sidebar'
import { CommandPalette } from './command-palette'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {children}
      </div>
      <CommandPalette />
    </div>
  )
}
