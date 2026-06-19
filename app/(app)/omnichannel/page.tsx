'use client'

import { useState } from 'react'
import { conversations } from '@/lib/mock-data'
import type { Conversation, ConvStatus } from '@/lib/mock-data'
import { Topbar } from '@/components/layout/topbar'
import { cn } from '@/lib/utils'
import {
  MessageSquare,
  Mail,
  Search,
  Send,
  Paperclip,
  MoreHorizontal,
  Circle,
  CheckCheck,
  Bot,
  Tag,
  UserCheck,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const channelIcon = {
  whatsapp: () => <span className="text-green-500 font-bold text-[10px]">WA</span>,
  telegram: () => <span className="text-blue-400 font-bold text-[10px]">TG</span>,
  email: () => <Mail className="w-3 h-3 text-muted-foreground" />,
  chat: () => <MessageSquare className="w-3 h-3 text-primary" />,
}

const statusColor: Record<ConvStatus, string> = {
  open: 'bg-success',
  pending: 'bg-warning',
  resolved: 'bg-muted-foreground',
  closed: 'bg-muted-foreground/40',
}

const fakeMessages = [
  { id: 1, from: 'contact', text: 'Olá! Preciso de informações sobre o plano Enterprise.', time: '10:15' },
  { id: 2, from: 'agent', text: 'Olá Marcos! Claro, posso te ajudar. Quantos usuários você precisa?', time: '10:17' },
  { id: 3, from: 'contact', text: 'Temos uma equipe de cerca de 50 pessoas.', time: '10:18' },
  { id: 4, from: 'agent', text: 'Ótimo! Nesse caso recomendamos o plano Enterprise Plus com módulos de IA inclusos.', time: '10:20' },
  { id: 5, from: 'contact', text: 'Pode me enviar a proposta revisada?', time: '10:30' },
]

export default function OmnichannelPage() {
  const [selected, setSelected] = useState<Conversation | null>(conversations[0])
  const [messageText, setMessageText] = useState('')
  const [query, setQuery] = useState('')

  const filtered = conversations.filter(
    (c) =>
      c.contact.toLowerCase().includes(query.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(query.toLowerCase())
  )

  const sendMessage = () => {
    if (!messageText.trim()) return
    toast.success('Mensagem enviada')
    setMessageText('')
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Omnichannel" description="Caixa de entrada unificada — WhatsApp, Telegram, E-mail, Chat" />
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-border bg-card flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Buscar conversas..." className="pl-8 h-8 text-xs" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((conv) => {
              const ChIcon = channelIcon[conv.channel]
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={cn(
                    'w-full text-left p-3 border-b border-border/50 hover:bg-muted/40 transition-colors',
                    selected?.id === conv.id && 'bg-muted/60'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                        {conv.contact.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card', statusColor[conv.status])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-foreground truncate">{conv.contact}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <ChIcon />
                          {conv.unread > 0 && (
                            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">{conv.unread}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Chat area */}
        {selected ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                  {selected.contact.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selected.contact}</p>
                  <div className="flex items-center gap-1">
                    <Circle className="w-2 h-2 fill-success text-success" />
                    <span className="text-[11px] text-muted-foreground capitalize">{selected.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" onClick={() => toast.info('Atribuindo conversa')}>
                  <UserCheck className="w-3.5 h-3.5" /> Atribuir
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" onClick={() => toast.info('Adicionando tag')}>
                  <Tag className="w-3.5 h-3.5" /> Tag
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {fakeMessages.map((msg) => (
                <div key={msg.id} className={cn('flex', msg.from === 'agent' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm',
                    msg.from === 'agent'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card border border-border text-foreground rounded-bl-sm'
                  )}>
                    <p>{msg.text}</p>
                    <div className={cn('flex items-center gap-1 mt-1', msg.from === 'agent' ? 'justify-end' : 'justify-start')}>
                      <span className={cn('text-[10px]', msg.from === 'agent' ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{msg.time}</span>
                      {msg.from === 'agent' && <CheckCheck className="w-3 h-3 text-primary-foreground/60" />}
                    </div>
                  </div>
                </div>
              ))}
              {/* Typing indicator */}
              <div className="flex items-center gap-1 ml-1">
                <div className="flex gap-0.5 px-3 py-2 rounded-2xl bg-card border border-border">
                  {[0.3, 0.5, 0.7].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">{selected.contact} está digitando...</span>
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="mx-4 mb-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
              <Bot className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground flex-1">
                <span className="font-semibold text-primary">Sugestão IA:</span> Enviar a proposta do plano Enterprise Plus com desconto de 10% para fechar este trimestre.
              </p>
              <button
                className="text-[10px] text-primary font-semibold hover:underline flex-shrink-0"
                onClick={() => setMessageText('Segue em anexo a proposta revisada do plano Enterprise Plus com 10% de desconto especial para este trimestre.')}
              >
                Usar
              </button>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border bg-card/60">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8 flex-shrink-0">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 h-9"
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button size="icon" className="w-9 h-9 flex-shrink-0" onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Selecione uma conversa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
