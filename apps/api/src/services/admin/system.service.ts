import { prisma } from "@archive/database";

export const adminSystemService = {
  async getSystemOverview() {
    let database: "CONNECTED" | "DISCONNECTED" = "CONNECTED";

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "DISCONNECTED";
    }

    return {
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage(),
      database,
      api: "ONLINE",
    };
  },
};