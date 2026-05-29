import { FastifyReply, FastifyRequest } from "fastify";
import { getUserDashboardSummary } from "../services/user-dashboard.service";

type UserDashboardParams = {
  userId: string;
};

export const getUserDashboardController = async (
  request: FastifyRequest<{ Params: UserDashboardParams }>,
  reply: FastifyReply
) => {
  const { userId } = request.params;

  const dashboardSummary = await getUserDashboardSummary(userId);

  if (!dashboardSummary) {
    return reply.status(404).send({
      success: false,
      message: "User not found",
    });
  }

  return reply.status(200).send({
    success: true,
    message: "User dashboard summary fetched successfully",
    data: dashboardSummary,
  });
};