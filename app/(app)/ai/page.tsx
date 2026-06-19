'use client'

import { useState, useRef, useEffect } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { cn } from '@/lib/utils'
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  MessageSquare,
  FileText,
  Zap,
  User,
  Loader2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const quickActions = [
  { label: 'Resumir atividades de hoje', icon: Sparkles },
  { label: 'Quais leads precisam de follow-up?', icon: TrendingUp },
  { label: 'Sugerir resposta para última conversa', icon: MessageSquare },
  { label: 'Gerar resumo executivo', icon: FileText },
]

const aiInsights = [
  { type: 'alert', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', title: 'Fatura vencida — Logística Rápida', desc: 'NF-2025-004 venceu há 12 dias. Recomendo contato imediato.' },
  { type: 'opportunity', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', title: 'TechCorp pronta para fechar', desc: 'Proposta em análise há 3 dias. Probabilidade: 75%. Follow-up recomendado.' },
  { type: 'insight', icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10', title: 'Oportunidade identificada', desc: 'EduTech BR acessou o portal 5x esta semana. Engajamento alto — ótimo momento para contato.' },
  { type: 'insight', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'Automação sugerida', desc: 'Leads na etapa "Contatado" há mais de 7 dias poderiam ser reativados com e-mail automático.' },
]

const seedMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Olá! Sou o NexCRM AI, seu copiloto inteligente. Posso resumir suas atividades, analisar leads, sugerir próximas ações e muito mais. Como posso ajudar hoje?',
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  },
]

const mockResponses: Record<string, string> = {
  default: 'Com base nos dados do seu CRM, identifiquei que você tem 3 leads em estágio de qualificação que precisam de atenção. Os leads Marcos Pereira (TechCorp) e Thiago Melo (Melo Construções) apresentam alto potencial de conversão esta semana. Posso gerar uma proposta personalizada para cada um?',
}

function getAiResponse(query: string): string {
  const q = query.toLowerCase()
  if (q.includes('lead') || q.includes('follow')) return 'Analisando seus leads ativos... Marcos Pereira (TechCorp, R$ 48K) está em proposta há 3 dias — alta prioridade para follow-up hoje. Diego Castro (Logística Rápida) não teve contato em 5 dias. Beatriz Santos (EduTech) demonstrou engajamento crescente no portal esta semana.'
  if (q.includes('fatura') || q.includes('financ')) return 'Status financeiro: R$ 62.000 recebidos (InovaTech), R$ 48.000 pendentes (TechCorp, vence em 15/06) e R$ 24.000 em atraso (Logística Rápida, venceu em 30/04). Recomendo priorizar contato com Logística Rápida para regularizar o débito.'
  if (q.includes('resumo') || q.includes('hoje')) return 'Resumo executivo do dia:\n\n• 8 leads ativos — 2 em proposta\n• 4 conversas abertas no omnichannel\n• 3 tarefas com prazo hoje\n• 1 fatura vencida (R$ 24K)\n• Pipeline total: R$ 165.500\n\nPrioridade máxima: fechar TechCorp (proposta enviada) e regularizar Logística Rápida.'
  return mockResponses.default
}

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>(seedMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim()
    if (!content || loading) return
    setInput('')

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    await new Promise((r) => setTimeout(r, 1200))

    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAiResponse(content),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, assistantMsg])
    setLoading(false)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Assistente IA" description="Copiloto inteligente para seu CRM" />
      <div className="flex flex-1 overflow-hidden">
        {/* Left — Chat */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r border-border">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={cn(
                  'max-w-md lg:max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border text-foreground rounded-bl-sm'
                )}>
                  {msg.content}
                  <p className={cn('text-[10px] mt-1.5', msg.role === 'user' ? 'text-primary-foreground/60 text-right' : 'text-muted-foreground')}>
                    {msg.timestamp}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-card border border-border flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                  <span className="text-xs text-muted-foreground">Analisando dados do CRM...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-3 grid grid-cols-2 gap-2">
              {quickActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => sendMessage(a.label)}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-border text-xs text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <a.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-card/60">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte ao seu copiloto de CRM..."
                className="flex-1 h-10"
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={loading}
              />
              <Button size="icon" className="w-10 h-10" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Right — Insights panel */}
        <div className="w-72 flex-shrink-0 overflow-y-auto bg-card/40 p-4 space-y-4 hidden lg:block">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Insights em tempo real</h3>
          </div>
          {aiInsights.map((insight, i) => (
            <div key={i} className="flex gap-2.5 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', insight.bg)}>
                <insight.icon className={cn('w-3.5 h-3.5', insight.color)} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{insight.desc}</p>
                <button
                  className="text-[11px] text-primary font-semibold mt-1 hover:underline"
                  onClick={() => sendMessage(insight.title)}
                >
                  Analisar
                </button>
              </div>
            </div>
          ))}

          {/* Prompt history */}
          <div className="pt-2 border-t border-border">
            <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/60 mb-2">Histórico recente</p>
            {['Resumo executivo', 'Leads para follow-up', 'Status financeiro'].map((h) => (
              <button
                key={h}
                onClick={() => sendMessage(h)}
                className="flex items-center gap-2 w-full py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
