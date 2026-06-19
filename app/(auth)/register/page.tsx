'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { label: 'Letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Número', test: (v: string) => /\d/.test(v) },
  { label: 'Caractere especial', test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
]

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  company: z.string().min(2, 'Obrigatório'),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/\d/)
    .regex(/[^a-zA-Z0-9]/),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [password, setPassword] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 1200))
    toast.success('Conta criada! Verifique seu e-mail.')
    router.push('/login')
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 lg:hidden mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <span className="font-semibold">NexCRM</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">Comece gratuitamente — sem cartão</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" placeholder="Rafael Mendes" autoComplete="name" {...register('name')} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" placeholder="NexCRM" autoComplete="organization" {...register('company')} aria-invalid={!!errors.company} />
            {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail corporativo</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="voce@empresa.com" {...register('email')} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('password', { onChange: (e) => setPassword(e.target.value) })}
              aria-invalid={!!errors.password}
              className="pr-10"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Alternar visibilidade">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="grid grid-cols-2 gap-1 mt-1">
              {passwordRules.map((rule) => {
                const ok = rule.test(password)
                return (
                  <div key={rule.label} className={cn('flex items-center gap-1 text-[11px]', ok ? 'text-success' : 'text-muted-foreground')}>
                    {ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {rule.label}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar conta'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
