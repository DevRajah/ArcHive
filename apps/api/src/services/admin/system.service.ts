import { prisma } from "@archive/database";

export const adminSystemService = {
  async getSystemOverview() {
    let database: "CONNECTED" | "DISCONNECTED" = "CONNECTED";

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "DISCONNECTED";
    }

    const memory = process.memoryUsage();

    return {
      api: "ONLINE",
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      database,
      memory: {
        rssMb: Math.round(memory.rss / 1024 / 1024),
        heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
        heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
        externalMb: Math.round(memory.external / 1024 / 1024),
      },
    };
  },
};