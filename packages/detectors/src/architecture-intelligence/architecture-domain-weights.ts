export const architectureDomainWeights = {
  ENGINEERING_INTELLIGENCE: {
    repositoryTypes: ["ENGINEERING_INTELLIGENCE_PLATFORM"],
    technologies: ["Engineering Intelligence", "Repository Intelligence"],
    architectureDomains: ["ENGINEERING_INTELLIGENCE"],
    engineeringSignals: ["ARCHITECTURE_REASONING"],
    capabilities: ["REPOSITORY_ANALYSIS", "ENGINEERING_INTELLIGENCE"],
  },

  BACKEND_SYSTEMS: {
    repositoryTypes: ["BACKEND_SERVICE", "JAVASCRIPT_TYPESCRIPT_PROJECT"],
    technologies: ["Node.js", "Express", "Fastify", "NestJS", "TypeScript"],
    architectureDomains: ["BACKEND_SYSTEMS", "SERVICE_ARCHITECTURE", "API_LAYER"],
    engineeringSignals: ["BACKEND_ENGINEERING", "BACKEND_APPLICATION_DEVELOPMENT"],
    capabilities: ["API_LAYER", "AUTHENTICATION"],
  },

  FRONTEND_ARCHITECTURE: {
    repositoryTypes: ["FRONTEND_APPLICATION"],
    technologies: ["React", "React / Frontend UI", "Next.js", "Tailwind CSS"],
    architectureDomains: ["FRONTEND_ARCHITECTURE"],
    engineeringSignals: ["USER_INTERFACE_ENGINEERING"],
    capabilities: ["FRONTEND_UI"],
  },

  QUEUE_INFRASTRUCTURE: {
    repositoryTypes: ["MESSAGING_PLATFORM"],
    technologies: ["BullMQ", "Redis", "Background Jobs / Queue"],
    architectureDomains: ["QUEUE_INFRASTRUCTURE"],
    engineeringSignals: ["BACKGROUND_PROCESSING"],
    capabilities: ["QUEUE_INFRASTRUCTURE"],
  },

  DATABASE_LAYER: {
    repositoryTypes: [],
    technologies: ["Database", "PostgreSQL", "MongoDB", "Prisma", "Redis"],
    architectureDomains: ["DATABASE_LAYER"],
    engineeringSignals: ["DATA_PERSISTENCE"],
    capabilities: ["DATABASE_LAYER"],
  },

  REALTIME_SYSTEMS: {
    repositoryTypes: ["COLLABORATION_PLATFORM"],
    technologies: ["Socket.IO", "Socket.IO / Realtime Events", "WebSocket", "Server-Sent Events"],
    architectureDomains: ["REALTIME_SYSTEMS"],
    engineeringSignals: ["REALTIME_INFRASTRUCTURE", "REALTIME_COLLABORATION"],
    capabilities: ["REALTIME_SYSTEMS"],
  },

  DEVTOOL_ARCHITECTURE: {
    repositoryTypes: ["DEVTOOL_PLATFORM", "DEVELOPER_PLATFORM"],
    technologies: ["Developer Tooling", "Developer Infrastructure"],
    architectureDomains: ["DEVELOPER_INFRASTRUCTURE"],
    engineeringSignals: ["CODE_GENERATION", "PLATFORM_ENGINEERING"],
    capabilities: ["CODE_GENERATION"],
  },

  FINANCIAL_SYSTEMS: {
    repositoryTypes: ["FINTECH_PLATFORM"],
    technologies: ["Financial Infrastructure"],
    architectureDomains: ["FINANCIAL_SYSTEMS"],
    engineeringSignals: ["FINANCIAL_PROCESSING"],
    capabilities: [],
  },
} as const;