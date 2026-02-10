import dotenv from "dotenv";
import path from "path";

class Env {
    APP_NAME: string;
    APP_SECRET: string;
    APP_VERSION: string;
    APP_SSL: boolean;
    APP_DOMAIN: string;

    SERVER_HOST: string;
    SERVER_PORT: number;

    MYSQL_HOST: string;
    MYSQL_PORT: number;
    MYSQL_DATABASE: string;
    MYSQL_USER_NAME: string;
    MYSQL_PASSWORD: string;

    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_DATABASE: number;
    REDIS_PASSWORD: string;

    TOKEN_HEADER: string;
    TOKEN_EXPIRE_TIME: number;

    constructor(envPath?: string) {
        dotenv.config({
            quiet: true,
            // 默认读取项目根目录 .env
            path: envPath || path.resolve(process.cwd(), ".env")
        });

        this.APP_NAME = process.env["APP_NAME"] || "api-starter";
        this.APP_SECRET = process.env["APP_SECRET"] || "abcdefghijklmnopqrstuvwxyz";
        this.APP_VERSION = process.env["APP_VERSION"] || "0.1.0";
        this.APP_SSL = this.toBoolean(process.env["APP_SSL"], false);
        this.APP_DOMAIN = process.env["APP_DOMAIN"] || "localhost:3000";

        this.SERVER_HOST = process.env["SERVER_HOST"] || "localhost";
        this.SERVER_PORT = this.toNumber(process.env["SERVER_PORT"], 3000);

        this.MYSQL_HOST = process.env["MYSQL_HOST"] || "localhost";
        this.MYSQL_PORT = this.toNumber(process.env["MYSQL_PORT"], 3306);
        this.MYSQL_DATABASE = process.env["MYSQL_DATABASE"] || "";
        this.MYSQL_USER_NAME = process.env["MYSQL_USER_NAME"] || "";
        this.MYSQL_PASSWORD = process.env["MYSQL_PASSWORD"] || "";

        this.REDIS_HOST = process.env["REDIS_HOST"] || "localhost";
        this.REDIS_PORT = this.toNumber(process.env["REDIS_PORT"], 6379);
        this.REDIS_DATABASE = this.toNumber(process.env["REDIS_DATABASE"], 0);
        this.REDIS_PASSWORD = process.env["REDIS_PASSWORD"] || "";

        this.TOKEN_HEADER = process.env["TOKEN_HEADER"] || "Authorization";
        this.TOKEN_EXPIRE_TIME = this.toNumber(process.env["TOKEN_EXPIRE_TIME"], 30);
    }

    private toBoolean(value: string | undefined, defaultValue = false): boolean {
        if (!value) {
            return defaultValue;
        }
        return value.toLowerCase() == "true" || value == "1";
    }

    private toNumber(value: string | undefined, defaultValue: number): number {
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    }
}

export const env = new Env();
