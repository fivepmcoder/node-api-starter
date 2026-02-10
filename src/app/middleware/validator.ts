import type { Context, Env, MiddlewareHandler, Next, ValidationTargets } from "hono";
import * as v from "valibot";
import type { BaseIssue, BaseSchema, InferOutput } from "valibot";
import { ValidationException } from "@/app/exception";

// 验证中间件
// target 数据来源，参见 ValidationTargets 定义
// schema 验证schema，使用valibot编写
export const validator = <
    Target extends keyof ValidationTargets,
    T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
    E extends Env = Env,
    P extends string = string,
    V extends {
        in: { [K in Target]: InferOutput<T> };
        out: { [K in Target]: InferOutput<T> };
    } = {
        in: { [K in Target]: InferOutput<T> };
        out: { [K in Target]: InferOutput<T> };
    }
>(
    target: Target,
    schema: T
): MiddlewareHandler<E, P, V> => {
    return async (ctx: Context, next: Next) => {
        const requestClone = ctx.req.raw.clone();
        let data: unknown;

        try {
            // 根据 target 获取数据
            switch (target) {
                case "param":
                    data = ctx.req.param();
                    break;
                case "query":
                    data = ctx.req.query();
                    break;
                case "json":
                    data = await requestClone.json();
                    break;
                case "form":
                    data = await requestClone.formData();
                    break;
                default:
                    throw new Error(`不支持的验证目标: ${target}`);
            }
        } catch {
            throw new ValidationException("请求数据格式错误");
        }

        // 验证数据是否符合要求
        const result = v.safeParse(schema, data);
        if (!result.success) {
            const firstIssue = result.issues[0];
            // 验证失败的提示通过验证异常抛出
            throw new ValidationException(firstIssue.message);
        }

        // 验证成功添加到验证数据中，可以直接使用上下文的 valid 获取验证过的数据
        // ctx.req.valid(target)
        ctx.req.addValidatedData(target, result.output as V["in"]);

        await next();
    };
};
