import { FastifyPluginAsync } from "fastify";
import { adminRepositoriesService } from "../../services/admin/repositories.service";
import { errorResponse, successResponse } from "../../utils/http-response";

type RepositoriesQuery = {
  page?: string;
  limit?: string;
  search?: string;
  language?: string;
  tracked?: string;
};

type RepositoryParams = {
  repositoryId: string;
};

const parseTracked = (value?: string) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const repositoriesRoute: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: RepositoriesQuery }>(
    "/repositories",
    async (request, reply) => {
      const repositories = await adminRepositoriesService.getRepositories({
        page: request.query.page ? Number(request.query.page) : undefined,
        limit: request.query.limit ? Number(request.query.limit) : undefined,
        search: request.query.search,
        language: request.query.language,
        tracked: parseTracked(request.query.tracked),
      });

      return successResponse(
        reply,
        "Admin repositories fetched successfully.",
        repositories
      );
    }
  );

  app.get<{ Params: RepositoryParams }>(
    "/repositories/:repositoryId",
    async (request, reply) => {
      const repository = await adminRepositoriesService.getRepository(
        request.params.repositoryId
      );

      if (!repository) {
        return errorResponse(reply, 404, "Repository not found.");
      }

      return successResponse(
        reply,
        "Admin repository fetched successfully.",
        repository
      );
    }
  );

  app.post<{ Params: RepositoryParams }>(
    "/repositories/:repositoryId/reprocess",
    async (request, reply) => {
      const result = await adminRepositoriesService.reprocessRepository(
        request.params.repositoryId
      );

      if (!result) {
        return errorResponse(reply, 404, "Repository not found.");
      }

      return successResponse(
        reply,
        "Repository intelligence reprocessed successfully.",
        result
      );
    }
  );

  app.delete<{ Params: RepositoryParams }>(
    "/repositories/:repositoryId",
    async (request, reply) => {
      const repository = await adminRepositoriesService.deleteRepository(
        request.params.repositoryId
      );

      if (!repository) {
        return errorResponse(reply, 404, "Repository not found.");
      }

      return successResponse(
        reply,
        "Repository deleted successfully.",
        repository
      );
    }
  );
};

export default repositoriesRoute;