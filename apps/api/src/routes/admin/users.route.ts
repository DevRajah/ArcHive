import { FastifyPluginAsync } from "fastify";
import { adminUsersService } from "../../services/admin/users.service";
import { successResponse } from "../../utils/http-response";

type UsersQuery = {
  page?: string;
  limit?: string;
  search?: string;
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
};

export default usersRoute;