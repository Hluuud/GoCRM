'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Topbar } from '@/components/layout/topbar'

const tabs = [
  { label: 'Leads', href: '/crm/leads' },
  { label: 'Contatos', href: '/crm/contacts' },
  { label: 'Empresas', href: '/crm/companies' },
  { label: 'Pipeline', href: '/crm/pipeline' },
  { label: 'Oportunidades', href: '/crm/opportunities' },
]

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="CRM" description="Gerencie leads, contatos e pipeline de vendas" />
      <div className="flex items-center gap-1 px-6 border-b border-border bg-card/60 overflow-x-auto">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
