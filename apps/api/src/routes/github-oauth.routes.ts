import { FastifyInstance } from "fastify";
import axios from "axios";
import { prisma } from "@archive/database";

type GitHubAccessTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
};

type GitHubUserResponse = {
  id: number;
  login: string;
  avatar_url?: string;
  email?: string;
};

const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || "http://localhost:3000";
};

const redirectToOAuthFailure = (reply: any) => {
  return reply.redirect(`${getFrontendUrl()}/connect-github?error=github_oauth_failed`);
};

export const githubOAuthRoutes = async (app: FastifyInstance) => {
  app.get("/login", async (_request, reply) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const callbackUrl = process.env.GITHUB_OAUTH_CALLBACK_URL;

    if (!clientId || !callbackUrl) {
      return reply.status(500).send({
        success: false,
        message: "GitHub OAuth is not configured",
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: "read:user repo admin:repo_hook",
    });

    return reply.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`
    );
  });

  app.get("/callback", async (request, reply) => {
    try {
      const { code, mode } = request.query as {
        code?: string;
        mode?: "json" | "redirect";
      };

      if (!code) {
        return redirectToOAuthFailure(reply);
      }

      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      const callbackUrl = process.env.GITHUB_OAUTH_CALLBACK_URL;

      if (!clientId || !clientSecret || !callbackUrl) {
        return redirectToOAuthFailure(reply);
      }

      // I exchange the temporary GitHub code for an access token on the backend
      // because the client secret must never be exposed in the frontend.
      const tokenResponse = await axios.post<GitHubAccessTokenResponse>(
        "https://github.com/login/oauth/access_token",
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: callbackUrl,
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        return redirectToOAuthFailure(reply);
      }

      const githubUserResponse = await axios.get<GitHubUserResponse>(
        "https://api.github.com/user",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      const githubUser = githubUserResponse.data;

      let user = await prisma.user.findUnique({
        where: {
          githubId: String(githubUser.id),
        },
      });

      if (!user) {
        user = await prisma.user.findUnique({
          where: {
            username: githubUser.login,
          },
        });
      }

      if (user) {
        user = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            githubId: String(githubUser.id),
            username: githubUser.login,
            email: githubUser.email || null,
            avatarUrl: githubUser.avatar_url || null,
            // I store the GitHub access token on the backend only.
            // It must never be sent back through the frontend URL.
            githubAccessToken: accessToken,
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            githubId: String(githubUser.id),
            username: githubUser.login,
            email: githubUser.email || null,
            avatarUrl: githubUser.avatar_url || null,
            githubAccessToken: accessToken,
          },
        });
      }

      // Optional API/testing mode:
      // Visit callback with ?mode=json only when manually testing OAuth response.
      if (mode === "json") {
        return reply.send({
          success: true,
          message: "GitHub account connected successfully",
          data: {
            userId: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
          },
        });
      }

      const encodedUsername = encodeURIComponent(user.username);
      const encodedAvatarUrl = encodeURIComponent(user.avatarUrl || "");

      return reply.redirect(
        `${getFrontendUrl()}/github/callback?userId=${user.id}&username=${encodedUsername}&avatarUrl=${encodedAvatarUrl}`
      );
    } catch (error) {
      request.log.error(error);

      return redirectToOAuthFailure(reply);
    } 
  });
}; 