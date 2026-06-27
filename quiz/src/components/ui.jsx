export function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:shadow-[0_8px_24px_oklch(0.7_0.19_40_/_0.22)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-card hover:bg-accent",
    ghost: "hover:bg-muted text-muted-foreground hover:text-foreground",
    danger: "text-destructive hover:bg-destructive/10",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-11 rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`min-h-24 rounded-xl border border-input bg-card px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-border bg-card scando-shadow-lg ${className}`}>{children}</div>;
}

export function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-muted/70 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

export function Header({ title, onBack, actionLabel = "Back" }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:px-6">
        <Button variant="ghost" onClick={onBack}>
          {actionLabel}
        </Button>
        <div>
          <p className="text-xl font-bold leading-none">Pace</p>
          <p className="mt-1 text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </header>
  );
}