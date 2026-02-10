import { env } from "@/config";
import * as v from "valibot";

// 排序规则
export enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}

// 分页请求参数
// schema 附加的请求参数模式
export const PageRequestSchema = <T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
    schema?: T
) => {
    const pageSchema = v.object({
        page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
        pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(1000)), 10),
        sortBy: v.optional(v.string()),
        sortOrder: v.optional(v.enum(SortOrder), SortOrder.ASC)
    });

    if (schema) {
        return v.intersect([pageSchema, schema]);
    }
    return pageSchema;
};

// 分页响应参数
export const PageResponseSchema = <T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
    pageSchema: T
) =>
    v.object({
        list: v.array(pageSchema),
        total: v.number()
    });

// 全局授权用户
export interface ApiUser {
    userId: string;
    userName: string;
    status: boolean;
}

// 系统常量
export const SYSTEM_CONSTANT = {
    // 超级管理员标志
    SUPER_ADMIN_ID: "1",

    // 缓存前缀
    REDIS: {
        // 角色权限缓存
        SYS_ROLE_PERMISSION_CACHE_NAME: env.APP_NAME + ":sys-role-permission:",
        // 用户角色缓存
        SYS_USER_ROLE_CACHE_NAME: env.APP_NAME + ":sys-user-role:",
        // 授权用户缓存
        API_USER_CACHE_NAME: env.APP_NAME + ":api-user:token-id:"
    }
};
