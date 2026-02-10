import { GenderEnum } from "@/app/schema/sys-user";
import * as v from "valibot";

export const createUserSchema = v.object({
    userName: v.pipe(v.string(), v.nonEmpty("用户名不能为空")),
    password: v.pipe(v.string(), v.nonEmpty("密码不能为空")),
    nickName: v.optional(v.nullable(v.string())),
    phone: v.optional(v.nullable(v.string())),
    avatar: v.optional(v.nullable(v.string())),
    gender: v.optional(v.enum(GenderEnum), GenderEnum.UNKNOWN),
    status: v.optional(v.boolean(), true),
    roleIds: v.optional(v.nullable(v.array(v.string())))
});
