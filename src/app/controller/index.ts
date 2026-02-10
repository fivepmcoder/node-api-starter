import { Hono } from "hono";
import { BaseException } from "@/app/exception";
import { R } from "@/core";
import { registerAdminApi } from "@/app/controller/admin";

// 注册所有 api 路由
export const registerApi = (app: Hono) => {
    // 自定义错误，返回统一响应
    app.onError((error, ctx) => {
        if (error instanceof BaseException) {
            return R.fail({
                code: error.code,
                message: error.message
            }).send(ctx);
        }
        console.error(error);
        return R.fail({ message: "服务器内部错误" }).send(ctx);
    });

    const api = new Hono();

    // 注册 admin api
    registerAdminApi(api);

    // 增加所有 api 路由前缀，/api
    app.route("api", api);
};
