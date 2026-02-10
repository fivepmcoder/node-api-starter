import {
    authRequestSchema,
    authResponseSchema,
    userResponseSchema
} from "@/app/controller/admin/auth/schema";
import { security } from "@/app/middleware/security";
import { validator } from "@/app/middleware/validator";
import { Auth } from "@/app/middleware/auth";
import { SysUserService } from "@/app/service/sys-user-service";
import { R } from "@/core";
import { Hono } from "hono";
import * as v from "valibot";
import { Encryption } from "@/app/security/encryption";
import { Token } from "@/app/security/token";

// 授权模块
const authApi = new Hono();

// 用户名密码登陆
authApi.post(
    "/login-password",
    validator("json", authRequestSchema),
    security({ logTitle: "登陆", logType: "login" }),
    async (ctx) => {
        const data = ctx.req.valid("json");

        const sysUserService = await SysUserService.create();
        const user = await sysUserService.findByUserName(data.userName);
        if (!user) {
            return R.fail({ message: "用户不存在" }).send(ctx);
        }
        if (!user.status) {
            return R.fail({ message: "用户状态异常" }).send(ctx);
        }
        if (!(await Encryption.verifyHash(data.password, user.password || ""))) {
            return R.fail({ message: "密码错误" }).send(ctx);
        }

        const token = await Token.generateToken({
            userId: user.userId || "",
            userName: user.userName || "",
            status: user.status
        });

        return R.success({ data: v.parse(authResponseSchema, token) }).send(ctx);
    }
);

// 获取授权信息
authApi.get("/user-info", security({ requireAuth: true }), async (ctx) => {
    const apiUser = Auth.getCurrentUser();
    if (!apiUser) {
        return R.fail({ message: "用户信息获取失败" }).send(ctx);
    }

    const sysUserService = await SysUserService.create();
    const user = await sysUserService.findByIdWithRolesAndMenus(apiUser.userId);

    return R.success({
        data: v.parse(userResponseSchema, {
            ...user,
            roles: user && user.roles,
            permissions:
                user &&
                user.roles &&
                user.roles.flatMap(
                    (role) => role.menus && role.menus.map((menu) => menu.permission)
                )
        })
    }).send(ctx);
});

// 退出登陆
authApi.post("/logout", security({ requireAuth: true }), async (ctx) => {
    const isRevoked = await Token.revokeToken(ctx);
    if (!isRevoked) {
        return R.fail().send(ctx);
    }

    return R.success().send(ctx);
});

export default authApi;
