import { format } from "date-fns";
import * as v from "valibot";

// 角色列表响应
export const roleListResponseSchema = v.object({
    roleId: v.string(),
    roleName: v.string(),
    roleCode: v.string(),
    roleDesc: v.optional(v.nullable(v.string())),
    sort: v.number(),
    status: v.boolean(),
    createTime: v.pipe(
        v.date(),
        v.transform((value) => format(value, "yyyy-MM-dd HH:mm:ss"))
    )
});
