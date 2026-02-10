import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

// 业务状态码
export enum BusinessCode {
    SUCCESS = 10200,
    FAIL = 10500,
    UNAUTHORIZED = 10401,
    FORBIDDEN = 10403
}

// 业务状态码消息
const BusinessMessage: Record<BusinessCode, string> = {
    [BusinessCode.SUCCESS]: "操作成功",
    [BusinessCode.FAIL]: "操作失败",
    [BusinessCode.UNAUTHORIZED]: "未授权",
    [BusinessCode.FORBIDDEN]: "权限不足"
};

export { BusinessMessage };

// 统一响应格式
interface Response<T = unknown> {
    code: BusinessCode;
    message: string;
    data?: T;
}

export class ResponseBuilder<T = unknown> {
    // 状态码
    private status: ContentfulStatusCode = 200;

    // 业务状态码
    private code: BusinessCode;

    // 业务提示消息
    private message: string;

    // 业务数据
    private data?: T;

    constructor(code: BusinessCode, message?: string, data?: T) {
        this.code = code;
        this.message = message || BusinessMessage[code] || "未知错误";
        if (data != undefined) {
            this.data = data;
        }
    }

    // 设置状态码
    setStatus(status: ContentfulStatusCode): this {
        this.status = status;
        return this;
    }

    // 设置业务状态码
    setCode(code: BusinessCode): this {
        this.code = code;
        this.message = BusinessMessage[code] || this.message;
        return this;
    }

    // 设置业务提示消息
    setMessage(message: string): this {
        this.message = message;
        return this;
    }

    // 设置业务返回数据
    setData(data: T): this {
        this.data = data;
        return this;
    }

    // 发送响应
    send(ctx: Context) {
        const body: Response<T> = {
            code: this.code,
            message: this.message
        };

        if (this.data != undefined) {
            body.data = this.data;
        }

        return ctx.json(body, { status: this.status });
    }

    // 成功响应
    static success(): ResponseBuilder<undefined>;
    static success<T>(params: {
        code?: BusinessCode;
        message?: string;
        data?: T;
    }): ResponseBuilder<T>;
    static success<T = undefined>(params?: {
        code?: BusinessCode;
        message?: string;
        data?: T;
    }): ResponseBuilder<T> {
        if (params == null) {
            params = {};
        }
        const code = params.code || BusinessCode.SUCCESS;
        const message = params.message || BusinessMessage[code] || "操作成功";
        const data = params.data;
        return new ResponseBuilder<T>(code, message, data);
    }

    // 失败响应
    static fail(): ResponseBuilder<undefined>;
    static fail<T>(params: { code?: BusinessCode; message?: string; data?: T }): ResponseBuilder<T>;
    static fail<T = undefined>(params?: {
        code?: BusinessCode;
        message?: string;
        data?: T;
    }): ResponseBuilder<T> {
        if (params == null) {
            params = {};
        }
        const code = params.code || BusinessCode.FAIL;
        const message = params.message || BusinessMessage[code] || "操作失败";
        const data = params.data;
        return new ResponseBuilder<T>(code, message, data);
    }
}
