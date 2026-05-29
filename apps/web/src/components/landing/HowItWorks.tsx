const steps = [
  {
    step: "01",
    title: "Connect GitHub",
    description: "ArcHive authenticates using GitHub OAuth and prepares repository access.",
  },
  {
    step: "02",
    title: "Import repositories",
    description: "Select repositories to track and ArcHive begins building repository intelligence.",
  },
  {
    step: "03",
    title: "Process engineering events",
    description: "Commits, pull requests, and webhooks are ingested through backend workers.",
  },
  {
    step: "04",
    title: "Generate architecture memory",
    description: "ArcHive builds timelines, detects architecture changes, and exposes engineering insights.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl font-bold tracking-tight">How ArcHive works</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="rounded-xl border border-border bg-background p-6">
              <p className="text-sm font-semibold text-primary">{item.step}</p>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}