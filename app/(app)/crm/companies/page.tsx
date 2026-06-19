'use client'

import { contacts } from '@/lib/mock-data'
import { Search, Plus, Building2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// Derive unique companies from contacts
const companies = Array.from(
  contacts.reduce((acc, c) => {
    if (!acc.has(c.company)) {
      acc.set(c.company, {
        name: c.company,
        contacts: 0,
        industry: c.tags[0] ?? 'Geral',
        primaryContact: c.name,
        since: c.createdAt,
      })
    }
    acc.get(c.company)!.contacts++
    return acc
  }, new Map<string, { name: string; contacts: number; industry: string; primaryContact: string; since: string }>())
    .values()
)

export default function CompaniesPage() {
  const [query, setQuery] = useState('')

  const filtered = [...companies].filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar empresas..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button size="sm" className="gap-2" onClick={() => toast.info('Nova empresa')}>
          <Plus className="w-3.5 h-3.5" /> Nova Empresa
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <Card key={company.name} className="p-4 hover:shadow-md transition-shadow border-border/60 cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{company.name}</h3>
                <Badge variant="secondary" className="text-[10px]">{company.industry}</Badge>
              </div>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Contato principal: <span className="text-foreground font-medium">{company.primaryContact}</span></p>
              <p>{company.contacts} contato{company.contacts !== 1 ? 's' : ''} cadastrado{company.contacts !== 1 ? 's' : ''}</p>
              <p>Cliente desde: {new Date(company.since).toLocaleDateString('pt-BR')}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
