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
            scope: "read:user repo",
        });

        return reply.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
    });

    app.get("/callback", async (request, reply) => {
        const { code } = request.query as { code?: string };

        if (!code) {
            return reply.status(400).send({
                success: false,
                message: "GitHub OAuth code is missing",
            });
        }

        const clientId = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        const callbackUrl = process.env.GITHUB_OAUTH_CALLBACK_URL;

        if (!clientId || !clientSecret || !callbackUrl) {
            return reply.status(500).send({
                success: false,
                message: "GitHub OAuth is not configured",
            });
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
            return reply.status(400).send({
                success: false,
                message: "Failed to retrieve GitHub access token",
            });
        }

        const githubUserResponse = await axios.get<GitHubUserResponse>("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
            },
        });

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
                    email: githubUser.email,
                    avatarUrl: githubUser.avatar_url,
                    githubAccessToken: accessToken,
                },
            });
        } else {
            user = await prisma.user.create({
                data: {
                    githubId: String(githubUser.id),
                    username: githubUser.login,
                    email: githubUser.email,
                    avatarUrl: githubUser.avatar_url,
                    githubAccessToken: accessToken,
                },
            });
        }

        return reply.send({
            success: true,
            message: "GitHub account connected successfully",
            data: {
                userId: user.id,
                username: user.username,
                avatarUrl: user.avatarUrl,
            },
        });
    });
};