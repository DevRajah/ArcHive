import { FastifyReply, FastifyRequest } from "fastify";
type UserDashboardParams = {
    userId: string;
};
export declare const getUserDashboardController: (request: FastifyRequest<{
    Params: UserDashboardParams;
}>, reply: FastifyReply) => Promise<never>;
export {};
//# sourceMappingURL=user-dashboard.controller.d.ts.map