import { FastifyPluginAsync } from "fastify";
import { adminUsersService } from "../../services/admin/users.service";
import { errorResponse, successResponse } from "../../utils/http-response";

type UsersQuery = {
  page?: string;
  limit?: string;
  search?: string;
};

type UserParams = {
  userId: string;
};

const usersRoute: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: UsersQuery }>("/users", async (request, reply) => {
    const users = await adminUsersService.getUsers({
      page: request.query.page ? Number(request.query.page) : undefined,
      limit: request.query.limit ? Number(request.query.limit) : undefined,
      search: request.query.search,
    });

    return successResponse(reply, "Admin users fetched successfully.", users);
  });

  app.get<{ Params: UserParams }>("/users/:userId", async (request, reply) => {
    const user = await adminUsersService.getUser(request.params.userId);

    if (!user) {
      return errorResponse(reply, 404, "User not found.");
    }

    return successResponse(reply, "Admin user fetched successfully.", user);
  });
};

export default usersRoute;