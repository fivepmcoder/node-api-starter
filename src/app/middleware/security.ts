import type { Context, MiddlewareHandler, Next } from "hono";
import { BusinessCode } from "@/core/response";
import { Auth } from "@/app/middleware/auth";
import { UnauthorizedException, ForbiddenException } from "@/app/exception";
import { SYSTEM_CONSTANT, type ApiUser } from "@/app/schema/system";
import type { SysLogInput } from "@/app/schema/sys-log";
import { routePath } from "hono/route";
import { SysLogService } from "@/app/service/sys-log-service";
import { SysUserService } from "@/app/service/sys-user-service";
import { Token } from "@/app/security/token";

// 中间件配置选项
interface SecurityMiddlewareConfig {
    // 是否需要授权
    requireAuth?: boolean;

    // 角色配置白名单
    role?: string;

    // 角色配置黑名单
    excludeRole?: string;

    // 权限配置白名单
    permission?: string;

    // 权限配置黑名单
    excludePermission?: string;

    // 日志标题
    logTitle?: string;

    // 日志类型
    logType?: "login" | "create" | "update" | "delete";

    // 前置自定义操作
    before?: (ctx: Context) => boolean | string | Promise<boolean | string>;

    // 后置自定义操作
    after?: (ctx: Context) => void | Promise<void>;
}

// 安全中间件
export const security = (config: SecurityMiddlewareConfig = {}): MiddlewareHandler => {
    return async function apiMiddleware(ctx: Context, next: Next) {
        // 检查是否需要记录日志
        const enableLog = requireLog(config);
        // 初始化
        const beginDate = new Date();
        let apiUser: ApiUser | null = null;
        let sysLogInput: SysLogInput | undefined;
        let responseData: string | undefined;
        try {
            // 读取请求参数
            if (enableLog) {
                sysLogInput = await insertLogData(ctx);
                updateLogData(sysLogInput, {
                    ...(config.logTitle && { logTitle: config.logTitle }),
                    ...(config.logType && { logType: config.logType }),
                    requestTime: beginDate
                });
            }
            // 获取用户信息，若未授权情况为 null
            apiUser = await Token.verifyToken(ctx);
            // 处理未登录情况
            if (!apiUser) {
                // 未登录，但不需要授权，直接放行
                if (!requireAuthentication(config)) {
                    await next();
                    return;
                }
                // 未登录，需要授权，抛出异常
                throw new UnauthorizedException();
            }

            // 已登陆，但状态异常
            if (!apiUser.status) {
                throw new UnauthorizedException("状态异常");
            }

            await Auth.userContext.run(apiUser, async () => {
                // 不是超级管理员，进行角色和权限检查
                if (apiUser && apiUser.userId != SYSTEM_CONSTANT.SUPER_ADMIN_ID) {
                    const roles: string[] = [];
                    let permissions: string[] = [];
                    const sysUserService = await SysUserService.create();
                    const user = await sysUserService.findByIdWithRolesAndMenus(apiUser.userId);
                    if (user && user.roles) {
                        user.roles.forEach((role) => {
                            roles.push(role.roleCode || "");
                            if (role.menus == null) {
                                role.menus = [];
                            }
                            permissions = permissions.concat(
                                role.menus.map((menu) => menu.permission || "")
                            );
                        });
                    }
                    // 角色和权限检查
                    if (config.role && !roles.includes(config.role)) {
                        throw new ForbiddenException(`需要角色 ${config.role}`);
                    }
                    if (config.excludeRole && roles.includes(config.excludeRole)) {
                        throw new ForbiddenException(`禁止角色 ${config.excludeRole} 访问`);
                    }
                    if (config.permission && !permissions.includes(config.permission)) {
                        throw new ForbiddenException(`缺少权限 ${config.permission}`);
                    }
                    if (
                        config.excludePermission &&
                        permissions.includes(config.excludePermission)
                    ) {
                        throw new ForbiddenException(`禁止权限 ${config.excludePermission}`);
                    }
                }

                // 执行请求处理
                await next();
            });
            // 请求后的日志逻辑
            if (enableLog) {
                // 克隆响应体，避免提前消费
                const responseClone = ctx.res.clone();
                const contentType = responseClone.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    responseData = await responseClone.text();
                }
                if (responseData) {
                    const maxLength = 10000;
                    updateLogData(sysLogInput, {
                        responseData:
                            responseData.length > maxLength
                                ? responseData.substring(0, maxLength) + "...[truncated]"
                                : responseData,
                        status: (() => {
                            try {
                                const parsed = JSON.parse(responseData) as { code?: number };
                                return parsed.code === BusinessCode.SUCCESS;
                            } catch {
                                return false;
                            }
                        })()
                    });
                }
            }
        } catch (error) {
            // 有异常的情况，首先记录日志，然后抛出异常
            if (enableLog && error instanceof Error) {
                updateLogData(sysLogInput, {
                    status: false,
                    message: error.message
                });
            }
            throw error;
        } finally {
            if (enableLog && sysLogInput) {
                if (apiUser) {
                    updateLogData(sysLogInput, {
                        ...(apiUser.userName && { userName: apiUser.userName }),
                        takeTime: new Date().getTime() - beginDate.getTime()
                    });
                }
                const sysLogService = await SysLogService.create();
                await sysLogService.insert(sysLogInput);
            }
        }
    };
};

// 判断是否需要认证
const requireAuthentication = (config: SecurityMiddlewareConfig): boolean => {
    return !!(
        config.requireAuth ||
        config.role ||
        config.excludeRole ||
        config.permission ||
        config.excludePermission
    );
};

// 判断是否记录日志
const requireLog = (config: SecurityMiddlewareConfig): boolean => {
    return !!(config.logTitle || config.logType);
};

// 获取客户端ip
const getClientIp = (ctx: Context): string => {
    const cfIp = ctx.req.header("cf-connecting-ip");
    const realIp = ctx.req.header("x-real-ip");
    const forwarded = ctx.req.header("x-forwarded-for") || "";
    const forwardedIp = forwarded.split(",")[0];

    // 安全获取 remoteAddress（ES2017 显式检查）
    let remoteAddress: string | undefined;
    const env = ctx.env as unknown;
    if (env !== null && env !== undefined && typeof env === "object" && "incoming" in env) {
        const incoming = (env as Record<string, unknown>)["incoming"];
        if (
            incoming !== null &&
            incoming !== undefined &&
            typeof incoming === "object" &&
            "socket" in incoming
        ) {
            const socket = (incoming as Record<string, unknown>)["socket"];
            if (
                socket !== null &&
                socket !== undefined &&
                typeof socket === "object" &&
                "remoteAddress" in socket
            ) {
                const addr = (socket as Record<string, unknown>)["remoteAddress"];
                if (typeof addr === "string") {
                    remoteAddress = addr;
                }
            }
        }
    }
    // 找到第一个有效的 IP
    const candidates: Array<string | undefined> = [cfIp, realIp, forwardedIp, remoteAddress];
    let foundIp: string | undefined;
    for (const candidate of candidates) {
        if (typeof candidate === "string" && candidate.length > 0) {
            foundIp = candidate;
            break;
        }
    }
    // 清理 IP 格式
    return (foundIp || "未知")
        .trim()
        .replace(/^\[|\]$/g, "")
        .replace(/^::ffff:/i, "")
        .replace(/^::1$/, "127.0.0.1");
};

// 收集日志数据
const insertLogData = async (ctx: Context): Promise<SysLogInput> => {
    const ip = getClientIp(ctx);
    const requestMethod = ctx.req.method.toLowerCase();

    // 获取请求数据
    const data: Record<string, unknown> = {
        param: ctx.req.param(),
        query: {
            ...ctx.req.queries(),
            ...ctx.req.query()
        }
    };
    if (["post", "put", "delete", "patch"].includes(requestMethod)) {
        const requestClone = ctx.req.raw.clone();
        const contentType = ctx.req.header("content-type") || "";
        if (contentType.includes("application/json")) {
            data["body"] = await requestClone.json().catch(() => {});
        }
    }

    return {
        requestMethod: requestMethod,
        apiUrl: routePath(ctx),
        requestData: JSON.stringify(data),
        ip: ip
    } as SysLogInput;
};

// 更新日志数据
// sysLogInput 日志数据
// updates 更新的数据
const updateLogData = (
    sysLogInput: SysLogInput | undefined,
    updates: Partial<SysLogInput>
): void => {
    if (!sysLogInput) {
        return;
    }
    Object.assign(sysLogInput, updates);
};
