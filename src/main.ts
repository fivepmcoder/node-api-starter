import "reflect-metadata";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { banner, env } from "@/config";
import { dalInit, dalClose } from "@/core";
import { registerApi } from "@/app/controller";

// 关闭服务，异步等待关闭完成
const closeServer = async (server: ReturnType<typeof serve>): Promise<void> => {
    // 关闭数据访问层
    await dalClose();
    return new Promise((resolve, reject) => {
        if (!server) {
            return reject(new Error("server not initialized yet"));
        }
        // 调用服务器的 close 方法，关闭监听
        server.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// 安全关闭服务
async function gracefulShutdown(server?: ReturnType<typeof serve>) {
    if (!server) {
        console.warn("server not initialized yet, exiting immediately");
        process.exit(1);
    }
    // 设置超时，避免关闭过程卡死，10秒后强制退出
    const timeout = setTimeout(() => {
        console.error("shutdown timed out, forcing exit");
        process.exit(1);
    }, 10000);

    try {
        // 等待服务器关闭完成
        await closeServer(server);
        clearTimeout(timeout);
        process.exit(0);
    } catch (err) {
        clearTimeout(timeout);
        console.error(err);
        process.exit(1);
    }
}

// 启动函数，初始化应用并启动服务器
async function bootstrap() {
    const app = new Hono();
    // 声明服务，避免监听错误
    // eslint-disable-next-line prefer-const
    let server: ReturnType<typeof serve>;

    // 监听 SIGINT 信号（Ctrl+C），调用关闭函数
    process.on("SIGINT", () => gracefulShutdown(server));
    // 监听 SIGTERM 信号，调用关闭函数
    process.on("SIGTERM", () => gracefulShutdown(server));
    // 捕获未捕获的异常，打印日志并退出
    process.on("uncaughtException", (err) => {
        console.error("uncaught exception:", err);
        process.exit(1);
    });
    // 捕获未处理的 Promise 拒绝，打印日志并退出
    process.on("unhandledRejection", (reason) => {
        console.error("unhandled rejection:", reason);
        process.exit(1);
    });

    // 初始化数据访问层
    await dalInit({
        ormConfig: {
            type: "mysql",
            host: env.MYSQL_HOST,
            port: env.MYSQL_PORT,
            database: env.MYSQL_DATABASE,
            username: env.MYSQL_USER_NAME,
            password: env.MYSQL_PASSWORD,
            poolSize: 10,
            extra: {
                charset: "utf8mb4"
            }
        },
        redisConfig: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            database: env.REDIS_DATABASE,
            password: env.REDIS_PASSWORD
        }
    });

    // 注册路由
    registerApi(app);

    // 创建并启动服务器，监听指定 host 和 port
    server = serve({
        fetch: app.fetch,
        hostname: env.SERVER_HOST,
        port: env.SERVER_PORT
    });

    // 打印启动横幅，显示应用信息
    banner({
        name: env.APP_NAME,
        version: env.APP_VERSION,
        ssl: env.APP_SSL,
        host: env.SERVER_HOST,
        port: env.SERVER_PORT
    });
}

bootstrap().catch((error) => {
    console.error(error);
});
