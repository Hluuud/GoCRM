'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FolderKanban,
  DollarSign,
  Bot,
  Settings,
  ChevronLeft,
  Building2,
  Briefcase,
  Bell,
  ChevronDown,
  LogOut,
  ChevronsUpDown,
} from 'lucide-react'
import { currentUser } from '@/lib/mock-data'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navGroups = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'CRM', href: '/crm', icon: Users },
      { label: 'Omnichannel', href: '/omnichannel', icon: MessageSquare },
    ],
  },
  {
    label: 'Operações',
    items: [
      { label: 'Projetos', href: '/projects', icon: FolderKanban },
      { label: 'Financeiro', href: '/financial', icon: DollarSign },
    ],
  },
  {
    label: 'Inteligência',
    items: [
      { label: 'Assistente IA', href: '/ai', icon: Bot },
    ],
  },
  {
    label: 'Configurações',
    items: [
      { label: 'Configurações', href: '/settings', icon: Settings },
    ],
  },
]

const workspaces = ['NexCRM Enterprise', 'Advocacia Nunes', 'Startup EduTech']

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar, activeWorkspace, setActiveWorkspace } = useAppStore()

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out overflow-hidden',
        sidebarOpen ? 'w-60' : 'w-16'
      )}
    >
      {/* Logo / Workspace */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border min-h-[60px]">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">N</span>
        </div>
        {sidebarOpen && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 flex-1 min-w-0 text-left hover:text-sidebar-primary-foreground transition-colors">
              <span className="text-sm font-semibold text-sidebar-foreground truncate">{activeWorkspace}</span>
              <ChevronsUpDown className="w-3.5 h-3.5 text-sidebar-foreground/50 flex-shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws}
                  onClick={() => setActiveWorkspace(ws)}
                  className={cn(activeWorkspace === ws && 'bg-accent')}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  {ws}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Briefcase className="w-4 h-4 mr-2" />
                Criar workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto flex-shrink-0 p-1 rounded-md hover:bg-sidebar-accent transition-colors"
          aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          <ChevronLeft
            className={cn(
              'w-4 h-4 text-sidebar-foreground/50 transition-transform duration-300',
              !sidebarOpen && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {sidebarOpen && (
              <p className="px-4 mb-1 text-[10px] uppercase tracking-widest font-semibold text-sidebar-foreground/35">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 mx-2 rounded-md text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Notifications badge */}
      {sidebarOpen && (
        <div className="px-4 py-2 border-t border-sidebar-border">
          <button className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
            <Bell className="w-4 h-4" />
            <span>Notificações</span>
            <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">4</span>
          </button>
        </div>
      )}

      {/* User */}
      <div className="px-2 py-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                {currentUser.avatar}
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</span>
                    <span className="text-[11px] text-sidebar-foreground/50 truncate">{currentUser.role}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-sidebar-foreground/50 ml-auto flex-shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/settings/profile">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Configurações</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
