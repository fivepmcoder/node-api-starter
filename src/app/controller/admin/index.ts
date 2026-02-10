import authApi from "@/app/controller/admin/auth/controller";
import userApi from "@/app/controller/admin/user/controller";
import { Hono } from "hono";

// 注册 admin api
export const registerAdminApi = (app: Hono): Hono => {
    const api = new Hono();

    api.route("auth", authApi);
    api.route("user", userApi);

    // 增加 admin 模块下路由前缀，/admin
    app.route("admin", api);

    return app;
};
