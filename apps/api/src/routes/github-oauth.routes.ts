import { FastifyInstance, FastifyReply } from "fastify";
import axios from "axios";
import { prisma } from "@archive/database";
import jwt from "jsonwebtoken";

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
  return (
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    process.env.WEB_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
};

const buildFrontendUrl = (path: string) => {
  return new URL(path, getFrontendUrl());
};

const redirectToOAuthFailure = (reply: FastifyReply) => {
  const failureUrl = buildFrontendUrl("/connect-github");

  failureUrl.searchParams.set("error", "github_oauth_failed");

  console.log("GitHub OAuth failure redirect URL:", failureUrl.toString());

  return reply.redirect(failureUrl.toString());
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

    const githubAuthorizationUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

    console.log("GitHub OAuth start URL:", githubAuthorizationUrl);
    console.log("GitHub OAuth callback URL:", callbackUrl);

    return reply.redirect(githubAuthorizationUrl);
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

      console.log("OAuth redirect env values:", {
        FRONTEND_URL: process.env.FRONTEND_URL,
        CLIENT_URL: process.env.CLIENT_URL,
        WEB_URL: process.env.WEB_URL,
        GITHUB_OAUTH_CALLBACK_URL: callbackUrl,
      });

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

      const appToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
        },
        process.env.JWT_SECRET || "dev-secret",
        {
          expiresIn: "7d",
        }
      );

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
            token: appToken,
          },
        });
      }

      // Generate the same JWT used by the rest of the application.
      // GitHub OAuth should establish an authenticated session identical
      // to the normal login flow.
      // const token = app.jwt.sign({
      //   userId: user.id,
      //   username: user.username,
      // });

      const finalRedirectUrl = buildFrontendUrl("/github/callback");

      finalRedirectUrl.searchParams.set("userId", user.id);
      finalRedirectUrl.searchParams.set("username", user.username);
      finalRedirectUrl.searchParams.set("avatarUrl", user.avatarUrl || "");
      finalRedirectUrl.searchParams.set("token", appToken);

      console.log(
        "GitHub OAuth final frontend redirect URL:",
        finalRedirectUrl.toString()
      );

      return reply.redirect(finalRedirectUrl.toString());
    } catch (error) {
      request.log.error(error);

      return redirectToOAuthFailure(reply);
    }
  });
};