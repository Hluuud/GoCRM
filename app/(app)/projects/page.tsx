'use client'

import { useState } from 'react'
import { projects, tasks } from '@/lib/mock-data'
import type { ProjectStatus, TaskStatus, TaskPriority } from '@/lib/mock-data'
import { Topbar } from '@/components/layout/topbar'
import { cn } from '@/lib/utils'
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Users,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const projectStatusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  planning: { label: 'Planejamento', color: 'bg-blue-500/10 text-blue-500' },
  active: { label: 'Ativo', color: 'bg-success/10 text-success' },
  on_hold: { label: 'Em pausa', color: 'bg-warning/10 text-warning-foreground' },
  completed: { label: 'Concluído', color: 'bg-muted text-muted-foreground' },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Baixa', color: 'text-muted-foreground' },
  medium: { label: 'Média', color: 'text-warning' },
  high: { label: 'Alta', color: 'text-orange-500' },
  critical: { label: 'Crítica', color: 'text-destructive' },
}

const taskStatusConfig: Record<TaskStatus, { label: string; icon: typeof Circle }> = {
  todo: { label: 'A fazer', icon: Circle },
  in_progress: { label: 'Em progresso', icon: Clock },
  review: { label: 'Revisão', icon: AlertCircle },
  done: { label: 'Concluída', icon: CheckCircle2 },
}

const taskColumns: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'A Fazer' },
  { status: 'in_progress', label: 'Em Progresso' },
  { status: 'review', label: 'Revisão' },
  { status: 'done', label: 'Concluído' },
]

export default function ProjectsPage() {
  const [view, setView] = useState<'board' | 'list'>('board')

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Projetos" description="Gerencie projetos, tarefas e sprints da equipe" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Projects Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Projetos ativos</h2>
            <Button size="sm" className="gap-2" onClick={() => toast.info('Novo projeto')}>
              <Plus className="w-3.5 h-3.5" /> Novo Projeto
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {projects.map((project) => {
              const s = projectStatusConfig[project.status]
              const p = priorityConfig[project.priority]
              return (
                <Card key={project.id} className="p-4 border-border/60 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', s.color)}>{s.label}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Abrir projeto</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">Arquivar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{project.name}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">{project.description}</p>
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-semibold text-foreground">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {project.team.length}
                    </div>
                    <span className={cn('font-medium', p.color)}>{p.label}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Kanban Tasks */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Tarefas — Kanban</h2>
            <div className="flex gap-2">
              <div className="flex border border-border rounded-md overflow-hidden">
                <button onClick={() => setView('board')} className={cn('px-3 py-1.5 text-xs font-medium transition-colors', view === 'board' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>Quadro</button>
                <button onClick={() => setView('list')} className={cn('px-3 py-1.5 text-xs font-medium transition-colors', view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>Lista</button>
              </div>
              <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.info('Nova tarefa')}>
                <Plus className="w-3.5 h-3.5" /> Tarefa
              </Button>
            </div>
          </div>

          {view === 'board' ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {taskColumns.map((col) => {
                const colTasks = tasks.filter((t) => t.status === col.status)
                const StatusIcon = taskStatusConfig[col.status].icon
                return (
                  <div key={col.status} className="flex-shrink-0 w-64">
                    <div className="flex items-center gap-2 mb-3">
                      <StatusIcon className={cn('w-4 h-4', col.status === 'done' ? 'text-success' : col.status === 'in_progress' ? 'text-warning' : col.status === 'review' ? 'text-orange-500' : 'text-muted-foreground')} />
                      <span className="text-sm font-semibold text-foreground">{col.label}</span>
                      <Badge variant="secondary" className="text-[10px]">{colTasks.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {colTasks.map((task) => {
                        const pp = priorityConfig[task.priority]
                        return (
                          <Card key={task.id} className="p-3 border-border/60 hover:shadow-sm transition-shadow cursor-pointer">
                            <p className="text-xs font-medium text-foreground mb-2">{task.title}</p>
                            <p className="text-[10px] text-muted-foreground mb-2">{task.project}</p>
                            <div className="flex items-center justify-between">
                              <span className={cn('text-[10px] font-semibold', pp.color)}>{pp.label}</span>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Card className="border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Tarefa</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Projeto</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Prioridade</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs hidden lg:table-cell">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const sc = taskStatusConfig[task.status]
                    const pc = priorityConfig[task.priority]
                    const StatusIcon = sc.icon
                    return (
                      <tr key={task.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground text-xs">{task.title}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">{task.project}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            <StatusIcon className={cn('w-3.5 h-3.5', task.status === 'done' ? 'text-success' : 'text-muted-foreground')} />
                            <span className="text-muted-foreground">{sc.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className={cn('text-xs font-medium', pc.color)}>{pc.label}</span></td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{new Date(task.dueDate).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}
