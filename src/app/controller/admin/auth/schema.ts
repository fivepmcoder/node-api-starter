import { roleListResponseSchema } from "@/app/controller/admin/role/schema";
import { GenderEnum } from "@/app/schema/sys-user";
import { format } from "date-fns";
import * as v from "valibot";

// 授权请求
export const authRequestSchema = v.object({
    userName: v.pipe(v.string(), v.nonEmpty("用户名不能为空")),
    password: v.pipe(v.string(), v.nonEmpty("密码不能为空")),
    uuid: v.optional(v.pipe(v.string(), v.nonEmpty("验证码不能为空"))),
    captcha: v.optional(v.pipe(v.string(), v.nonEmpty("验证码不能为空")))
});

// 授权响应
export const authResponseSchema = v.string();

// 授权用户信息
export const userResponseSchema = v.object({
    userId: v.string(),
    userName: v.string(),
    nickName: v.optional(v.nullable(v.string())),
    gender: v.optional(v.enum(GenderEnum)),
    phone: v.optional(v.nullable(v.string())),
    avatar: v.optional(v.nullable(v.string())),
    status: v.boolean(),
    createTime: v.pipe(
        v.date(),
        v.transform((value) => format(value, "yyyy-MM-dd HH:mm:ss"))
    ),
    roles: v.optional(v.array(roleListResponseSchema), []),
    permissions: v.optional(v.array(v.string()), [])
});
