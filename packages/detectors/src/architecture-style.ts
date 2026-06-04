export const detectArchitectureStyle = ({
  domains,
  technologies,
  signals,
}: {
  domains: string[];
  technologies: string[];
  signals: string[];
}) => {
  const styles = new Set<string>();

  if (
    domains.includes("REALTIME_SYSTEMS")
  ) {
    styles.add("REALTIME_PLATFORM");
  }

  if (
    domains.includes("QUEUE_INFRASTRUCTURE")
  ) {
    styles.add("QUEUE_DRIVEN");
  }

  if (
    signals.includes("BACKGROUND_PROCESSING")
  ) {
    styles.add("EVENT_DRIVEN");
  }

  if (
    domains.includes("API_LAYER")
  ) {
    styles.add("API_PLATFORM");
  }

  if (
    domains.includes("ARCHITECTURE_INTELLIGENCE")
  ) {
    styles.add("ENGINEERING_INTELLIGENCE");
  }

  if (
    styles.size === 0
  ) {
    styles.add("GENERAL_APPLICATION");
  }

  return Array.from(styles);
};