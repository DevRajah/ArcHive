export const Technologies = {
  BACKEND_SERVICES: "Backend Services",
  FRONTEND_ENGINEERING: "Frontend Engineering",

  FINANCIAL_INFRASTRUCTURE: "Financial Infrastructure",
  DEVELOPER_TOOLING: "Developer Tooling",
  DEVELOPER_INFRASTRUCTURE: "Developer Infrastructure",
  OBSERVABILITY: "Observability",
  SECURITY_SYSTEMS: "Security Systems",

  AI_ML: "AI / ML",
  DATA_ENGINEERING: "Data Engineering",
  MOBILE_APPLICATION: "Mobile Application",

  TRANSPORT_SYSTEMS: "Transport Systems",
  ENERGY_SYSTEMS: "Energy Systems",
  HEALTHCARE_TECHNOLOGY: "Healthcare Technology",
  COMMERCE_SYSTEMS: "Commerce Systems",
  EDUCATIONAL_TECHNOLOGY: "Educational Technology",
  COLLABORATION_SYSTEMS: "Collaboration Systems",

  TECHNICAL_DOCUMENTATION: "Technical Documentation",
  DESIGN_SYSTEMS: "Design Systems",
  PACKAGE_LIBRARIES: "Package Libraries",
  INFRASTRUCTURE_AUTOMATION: "Infrastructure Automation",
  MESSAGING_SYSTEMS: "Messaging Systems",

  TYPESCRIPT_CONTRACTS: "TypeScript Contracts",
  REPOSITORY_INTELLIGENCE: "Repository Intelligence",
  DATABASE_PRISMA: "Database / Prisma",
  BULLMQ: "BullMQ",
  BULLMQ_QUEUE_WORKER: "BullMQ / Queue Worker",
  SOCKET_IO_REALTIME_EVENTS: "Socket.IO / Realtime Events",
  PACKAGE_DEPENDENCIES: "Package Dependencies",
  CLIENT_STATE_HOOKS: "Client State / Hooks",
  API_LAYER: "API Layer",
} as const;

export type Technology = (typeof Technologies)[keyof typeof Technologies];