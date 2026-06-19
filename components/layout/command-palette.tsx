'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FolderKanban,
  DollarSign,
  Bot,
  Settings,
  UserPlus,
  FileText,
} from 'lucide-react'

const pages = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'CRM — Leads', href: '/crm/leads', icon: Users },
  { label: 'CRM — Contatos', href: '/crm/contacts', icon: Users },
  { label: 'CRM — Pipeline', href: '/crm/pipeline', icon: Users },
  { label: 'Omnichannel', href: '/omnichannel', icon: MessageSquare },
  { label: 'Projetos', href: '/projects', icon: FolderKanban },
  { label: 'Financeiro', href: '/financial', icon: DollarSign },
  { label: 'Assistente IA', href: '/ai', icon: Bot },
  { label: 'Configurações', href: '/settings', icon: Settings },
]

const actions = [
  { label: 'Novo lead', icon: UserPlus, href: '/crm/leads' },
  { label: 'Nova fatura', icon: FileText, href: '/financial' },
  { label: 'Novo projeto', icon: FolderKanban, href: '/projects' },
]

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen(!commandOpen)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [commandOpen, setCommandOpen])

  const navigate = (href: string) => {
    setCommandOpen(false)
    router.push(href)
  }

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="Buscar páginas, ações, contatos..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Páginas">
          {pages.map((page) => (
            <CommandItem key={page.href} onSelect={() => navigate(page.href)}>
              <page.icon className="w-4 h-4 mr-2 text-muted-foreground" />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ações rápidas">
          {actions.map((action) => (
            <CommandItem key={action.label} onSelect={() => navigate(action.href)}>
              <action.icon className="w-4 h-4 mr-2 text-muted-foreground" />
              {action.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
