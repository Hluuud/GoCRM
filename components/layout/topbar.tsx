'use client'

import { Search, Bell, Moon, Sun, Command } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TopbarProps {
  title: string
  description?: string
}

export function Topbar({ title, description }: TopbarProps) {
  const { theme, setTheme } = useTheme()
  const setCommandOpen = useAppStore((s) => s.setCommandOpen)

  return (
    <header className="h-[60px] flex items-center px-6 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground leading-none truncate">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        {/* Search trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 border border-border text-sm text-muted-foreground transition-colors w-44 md:w-56"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left text-xs">Buscar tudo...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border border-border px-1 text-[10px] font-mono text-muted-foreground/60">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Alternar tema"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
