export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-sidebar-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-sidebar-border) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-base">N</span>
          </div>
          <span className="text-sidebar-foreground font-semibold text-lg">NexCRM</span>
        </div>

        {/* Quote */}
        <div className="relative z-10 space-y-4">
          <blockquote className="text-2xl font-semibold text-sidebar-foreground leading-snug text-balance">
            &ldquo;A plataforma que unifica seus leads, conversas e projetos em um único lugar.&rdquo;
          </blockquote>
          <p className="text-sidebar-foreground/50 text-sm">
            Enterprise CRM · Omnichannel · IA · Financeiro
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6">
          {[
            { value: '12K+', label: 'Empresas ativas' },
            { value: '4.9★', label: 'Avaliação média' },
            { value: '99.9%', label: 'Uptime garantido' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-sidebar-primary">{s.value}</p>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        {children}
      </div>
    </div>
  )
}
