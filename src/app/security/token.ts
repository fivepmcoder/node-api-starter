import { SYSTEM_CONSTANT, type ApiUser } from "@/app/schema/system.js";
import { UnauthorizedException } from "@/app/exception";
import { Encryption } from "@/app/security/encryption";
import { env } from "@/config";
import { RedisClient } from "@/core";
import type { Context } from "hono";

export class Token {
    // 生成 token
    public static async generateToken(apiUser: ApiUser): Promise<string> {
        // 生成 token id
        const tokenId = this.generateTokenId();
        // 生成签名
        const signature = Encryption.generateSignature(tokenId);
        // 拼接 token
        const token = `${tokenId}.${signature}`;
        // 用户数据存入缓存
        const redis = await RedisClient.getInstance();
        const cache = await redis
            .getClient()
            .setex(
                `${SYSTEM_CONSTANT.REDIS.API_USER_CACHE_NAME}${tokenId}`,
                env.TOKEN_EXPIRE_TIME,
                JSON.stringify(apiUser)
            );
        if (!cache || cache != "OK") {
            return "";
        }

        return token;
    }

    // 验证 token
    public static async verifyToken(ctx: Context): Promise<ApiUser | null> {
        try {
            // 检查 token 存在
            const headerToken = ctx.req.header(env.TOKEN_HEADER);
            if (!headerToken) {
                return null;
            }
            const token = this.parseToken(headerToken);
            if (!token) {
                throw new UnauthorizedException("解析令牌失败");
            }
            const { tokenId, signature } = token;
            if (!tokenId || !signature) {
                throw new UnauthorizedException("令牌格式错误");
            }
            // 验证签名
            if (!Encryption.verifySignature(tokenId, signature)) {
                throw new UnauthorizedException("令牌签名错误");
            }
            // 从缓存中获取用户数据
            const redis = await RedisClient.getInstance();
            const cache = await redis
                .getClient()
                .get(`${SYSTEM_CONSTANT.REDIS.API_USER_CACHE_NAME}${tokenId}`);
            if (!cache) {
                throw new UnauthorizedException("令牌过期");
            }

            // 验证通过，返回授权用户数据
            return JSON.parse(cache) as ApiUser;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException("授权验证失败");
        }
    }

    // 撤销 token
    public static async revokeToken(ctx: Context): Promise<boolean> {
        try {
            // 检查 token 存在
            const headerToken = ctx.req.header(env.TOKEN_HEADER);
            if (!headerToken) {
                return false;
            }
            const token = this.parseToken(headerToken);
            if (!token) {
                return false;
            }
            const { tokenId, signature } = token;
            if (!tokenId || !signature) {
                return false;
            }
            // 验证签名
            if (!Encryption.verifySignature(tokenId, signature)) {
                return false;
            }
            // 从缓存中获取用户数据
            const redis = await RedisClient.getInstance();
            const cache = await redis
                .getClient()
                .del(`${SYSTEM_CONSTANT.REDIS.API_USER_CACHE_NAME}${tokenId}`);
            return cache > 0;
        } catch {
            return false;
        }
    }

    // 从请求头中提取并解析 token
    private static parseToken(headerToken: string): { tokenId: string; signature: string } | null {
        try {
            // 解析 Bearer Token
            const bearerToken = headerToken.split(" ");
            if (bearerToken.length != 2 || bearerToken[0] != "Bearer") {
                return null;
            }

            // 分割 token 为 tokenId 和 signature
            const [tokenId, signature] = (bearerToken[1] && bearerToken[1].split(".")) || [];
            if (!tokenId || !signature) {
                return null;
            }

            return { tokenId, signature };
        } catch {
            return null;
        }
    }

    // 生成 token id
    private static generateTokenId(): string {
        return crypto.randomUUID().replace(/-/g, "");
    }
}
