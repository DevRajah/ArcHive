"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubOAuthRoutes = void 0;
const fastify_1 = require("fastify");
const axios_1 = __importDefault(require("axios"));
const database_1 = require("@archive/database");
const githubOAuthRoutes = async (app) => {
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
        const { code } = request.query;
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
        const tokenResponse = await axios_1.default.post("https://github.com/login/oauth/access_token", {
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: callbackUrl,
        }, {
            headers: {
                Accept: "application/json",
            },
        });
        const accessToken = tokenResponse.data.access_token;
        if (!accessToken) {
            return reply.status(400).send({
                success: false,
                message: "Failed to retrieve GitHub access token",
            });
        }
        const githubUserResponse = await axios_1.default.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
            },
        });
        const githubUser = githubUserResponse.data;
        let user = await database_1.prisma.user.findUnique({
            where: {
                githubId: String(githubUser.id),
            },
        });
        if (!user) {
            user = await database_1.prisma.user.findUnique({
                where: {
                    username: githubUser.login,
                },
            });
        }
        if (user) {
            user = await database_1.prisma.user.update({
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
        }
        else {
            user = await database_1.prisma.user.create({
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
exports.githubOAuthRoutes = githubOAuthRoutes;
//# sourceMappingURL=github-oauth.routes.js.map