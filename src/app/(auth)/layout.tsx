export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-950 p-12 dark">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-white" />
          <span className="text-lg font-semibold text-white">Social Control</span>
        </div>

        <div className="space-y-4">
          <blockquote className="text-2xl font-medium leading-relaxed text-white">
            "Controla el cumplimiento de contenido de todos tus clientes desde un solo lugar."
          </blockquote>
          <p className="text-sm text-zinc-400">
            Diseñado para agencias de marketing que necesitan visibilidad total.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Clientes', value: '∞' },
            { label: 'Tipos de contenido', value: '4' },
            { label: 'Roles de equipo', value: '5' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/10 p-4">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-xs text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
