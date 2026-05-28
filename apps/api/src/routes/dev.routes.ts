import { FastifyInstance } from "fastify";
import { prisma } from "@archive/database";

export const devRoutes = async (app: FastifyInstance) => {
  app.post("/seed-user", async () => {
    // I use upsert so rerunning the seed route does not create duplicate dev users.
    const user = await prisma.user.upsert({
      where: {
        username: "DevRajah",
      },
      update: {},
      create: {
        githubId: "github_dev_001",
        username: "DevRajah",
        email: "devrajah@example.com",
        avatarUrl: "https://github.com/devrajah.png",
      },
    });

    return {
      success: true,
      message: "Development user seeded successfully",
      data: user,
    };
  });

  app.patch("/attach-repositories-to-user", async (request, reply) => {
  const { userId } = request.body as { userId?: string };

  if (!userId) {
    return reply.status(400).send({
      success: false,
      message: "userId is required",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return reply.status(404).send({
      success: false,
      message: "User not found",
    });
  }

  // I attach existing repositories owned by this GitHub username to my dev user.
  // This fixes old repos that were created before user ownership existed.
  const result = await prisma.repository.updateMany({
    where: {
      owner: user.username,
      userId: null,
    },
    data: {
      userId: user.id,
    },
  });

  return {
    success: true,
    message: "Repositories attached to user successfully",
    data: {
      matchedOwner: user.username,
      updatedCount: result.count,
    },
  };
});
};