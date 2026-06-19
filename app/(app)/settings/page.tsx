'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { cn } from '@/lib/utils'
import { currentUser, teamMembers } from '@/lib/mock-data'
import {
  User,
  Building2,
  Shield,
  Key,
  Bell,
  Globe,
  Activity,
  ChevronRight,
  Camera,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Smartphone,
  Monitor,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

const settingsNav = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'organization', label: 'Organização', icon: Building2 },
  { id: 'security', label: 'Segurança', icon: Shield },
  { id: 'api', label: 'Chaves de API', icon: Key },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'integrations', label: 'Integrações', icon: Globe },
  { id: 'audit', label: 'Logs de Auditoria', icon: Activity },
]

const apiKeys = [
  { id: 'k-001', name: 'Chave de Produção', key: 'nex_live_••••••••••••8f4a', created: '2025-01-10', lastUsed: '2025-05-12' },
  { id: 'k-002', name: 'Chave de Sandbox', key: 'nex_test_••••••••••••3c2b', created: '2025-02-01', lastUsed: '2025-05-10' },
]

const auditLogs = [
  { id: 1, action: 'Login realizado', user: 'Rafael Mendes', ip: '189.28.45.12', time: '2025-05-12 10:15:00' },
  { id: 2, action: 'Lead criado: Beatriz Santos', user: 'Rafael Mendes', ip: '189.28.45.12', time: '2025-05-12 09:30:00' },
  { id: 3, action: 'Fatura exportada: NF-2025-002', user: 'Ana Souza', ip: '189.28.46.8', time: '2025-05-11 16:45:00' },
  { id: 4, action: 'Usuário Carlos Lima: permissão alterada', user: 'Rafael Mendes', ip: '189.28.45.12', time: '2025-05-11 14:20:00' },
  { id: 5, action: 'Configuração de webhook atualizada', user: 'Rafael Mendes', ip: '189.28.45.12', time: '2025-05-10 11:00:00' },
]

const integrations = [
  { name: 'Slack', desc: 'Notificações em tempo real de leads e deals.', connected: true, icon: '🔗' },
  { name: 'Google Calendar', desc: 'Sincronizar compromissos e follow-ups.', connected: false, icon: '📅' },
  { name: 'WhatsApp Business API', desc: 'Canal oficial para omnichannel.', connected: true, icon: '💬' },
  { name: 'Stripe', desc: 'Cobranças e assinaturas automatizadas.', connected: false, icon: '💳' },
  { name: 'Zapier', desc: 'Automatize fluxos com 5000+ apps.', connected: false, icon: '⚡' },
  { name: 'HubSpot', desc: 'Importar/exportar contatos e leads.', connected: false, icon: '🔄' },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({
    newLead: true,
    dealClosed: true,
    newMessage: true,
    invoiceOverdue: true,
    teamActivity: false,
    weeklyReport: true,
  })

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Configurações" description="Gerencie sua conta, organização e preferências" />
      <div className="flex flex-1 overflow-hidden">
        {/* Settings Nav */}
        <aside className="w-56 flex-shrink-0 border-r border-border bg-card/40 p-3 overflow-y-auto">
          <nav className="space-y-0.5">
            {settingsNav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  activeSection === item.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {activeSection === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 overflow-y-auto p-6 max-w-2xl">
          {/* Profile */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-foreground">Perfil do usuário</h2>
              <Card className="p-6 border-border/60 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary text-xl font-bold flex items-center justify-center">
                      {currentUser.avatar}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors">
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{currentUser.name}</p>
                    <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    <Badge variant="secondary" className="text-[10px] mt-1">{currentUser.role}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="pname">Nome completo</Label>
                    <Input id="pname" defaultValue={currentUser.name} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pdept">Departamento</Label>
                    <Input id="pdept" defaultValue={currentUser.department} />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="pemail">E-mail</Label>
                    <Input id="pemail" type="email" defaultValue={currentUser.email} />
                  </div>
                </div>
                <Button onClick={() => toast.success('Perfil atualizado!')}>Salvar alterações</Button>
              </Card>
            </div>
          )}

          {/* Organization */}
          {activeSection === 'organization' && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-foreground">Organização</h2>
              <Card className="p-6 border-border/60 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <Label>Nome da organização</Label>
                    <Input defaultValue="NexCRM Enterprise" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Domínio</Label>
                    <Input defaultValue="nexcrm.io" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fuso horário</Label>
                    <Input defaultValue="America/Sao_Paulo" />
                  </div>
                </div>
                <Button onClick={() => toast.success('Organização atualizada!')}>Salvar</Button>
              </Card>

              {/* Team members */}
              <Card className="border-border/60 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="text-sm font-semibold text-foreground">Membros da equipe</h3>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={() => toast.info('Convidar membro')}>
                    <Plus className="w-3 h-3" /> Convidar
                  </Button>
                </div>
                <div className="divide-y divide-border/50">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{member.role}</Badge>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-foreground">Segurança</h2>
              <Card className="p-6 border-border/60 space-y-5">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />Alterar senha</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Senha atual</Label>
                    <div className="relative">
                      <Input type={showCurrentPass ? 'text' : 'password'} placeholder="••••••••" className="pr-10" />
                      <button onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nova senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirmar nova senha</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>
                <Button onClick={() => toast.success('Senha alterada com segurança!')}>Atualizar senha</Button>
              </Card>

              {/* MFA */}
              <Card className="p-6 border-border/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Autenticação em dois fatores (MFA)</h3>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Seu app autenticador está configurado. A verificação em 2 etapas está protegendo sua conta.</p>
                <Button variant="outline" size="sm" onClick={() => toast.info('Gerenciar dispositivos MFA')}>Gerenciar dispositivos</Button>
              </Card>

              {/* Sessions */}
              <Card className="border-border/60 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Sessões ativas</h3>
                  </div>
                </div>
                {[
                  { device: 'Chrome — macOS', ip: '189.28.45.12', location: 'São Paulo, BR', current: true, time: 'Agora' },
                  { device: 'Safari — iPhone', ip: '189.28.45.13', location: 'São Paulo, BR', current: false, time: 'há 2 horas' },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-border/50 last:border-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{session.device}</p>
                        {session.current && <Badge className="text-[9px] py-0 bg-success/10 text-success border-success/20">Atual</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{session.ip} · {session.location} · {session.time}</p>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive h-7" onClick={() => toast.success('Sessão encerrada')}>Revogar</Button>
                    )}
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* API Keys */}
          {activeSection === 'api' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Chaves de API</h2>
                <Button size="sm" className="gap-1.5" onClick={() => toast.info('Nova chave criada')}>
                  <Plus className="w-3.5 h-3.5" /> Gerar nova chave
                </Button>
              </div>
              <Card className="border-border/60 divide-y divide-border/50 overflow-hidden">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">{key.name}</p>
                      <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:text-destructive" onClick={() => toast.error('Chave revogada')}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-sm bg-muted rounded-md px-3 py-2">
                      <Key className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground flex-1">{key.key}</span>
                      <button className="text-[11px] text-primary hover:underline" onClick={() => toast.success('Copiado!')}>Copiar</button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Criada em {new Date(key.created).toLocaleDateString('pt-BR')} · Último uso: {new Date(key.lastUsed).toLocaleDateString('pt-BR')}</p>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold">Preferências de Notificações</h2>
              <Card className="border-border/60 divide-y divide-border/50 overflow-hidden">
                {(Object.entries(notifPrefs) as [keyof typeof notifPrefs, boolean][]).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    newLead: 'Novo lead criado',
                    dealClosed: 'Deal fechado',
                    newMessage: 'Nova mensagem omnichannel',
                    invoiceOverdue: 'Fatura vencida',
                    teamActivity: 'Atividade da equipe',
                    weeklyReport: 'Relatório semanal',
                  }
                  return (
                    <div key={key} className="flex items-center justify-between px-5 py-4">
                      <p className="text-sm text-foreground">{labels[key]}</p>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) => setNotifPrefs((prev) => ({ ...prev, [key]: checked }))}
                      />
                    </div>
                  )
                })}
              </Card>
              <Button onClick={() => toast.success('Preferências salvas!')}>Salvar preferências</Button>
            </div>
          )}

          {/* Integrations */}
          {activeSection === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold">Integrações</h2>
              <div className="grid grid-cols-1 gap-3">
                {integrations.map((int) => (
                  <Card key={int.name} className="p-4 border-border/60 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                      {int.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{int.name}</p>
                      <p className="text-xs text-muted-foreground">{int.desc}</p>
                    </div>
                    {int.connected ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span className="text-xs text-success font-medium">Conectado</span>
                        <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => toast.info(`Gerenciar ${int.name}`)}>Gerenciar</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => toast.info(`Conectando ${int.name}`)}>Conectar</Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Audit logs */}
          {activeSection === 'audit' && (
            <div className="space-y-6">
              <h2 className="text-base font-semibold">Logs de Auditoria</h2>
              <Card className="border-border/60 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Ação</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Usuário</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs hidden lg:table-cell">IP</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-foreground">{log.action}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{log.user}</td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground hidden lg:table-cell">{log.ip}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
