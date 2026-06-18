interface IntelligenceSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function IntelligenceSection({
  title,
  description,
  children,
}: IntelligenceSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>

        {description && (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}