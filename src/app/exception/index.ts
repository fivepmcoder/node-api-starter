import { BusinessCode } from "@/core/response";

// 基础错误类，所有自定义错误都继承自此类，会按照统一响应返回
export class BaseException extends Error {
    public code: BusinessCode;

    constructor(code: BusinessCode, message: string) {
        super(message);
        this.code = code;
        this.name = this.constructor.name;

        Object.setPrototypeOf(this, new.target.prototype);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// 验证错误类，参数校验失败
export class ValidationException extends BaseException {
    constructor(message = "参数验证失败") {
        super(BusinessCode.FAIL, message);
    }
}

// 未授权错误类，用户未登录或身份验证失败
export class UnauthorizedException extends BaseException {
    constructor(message = "未授权，请先登录") {
        super(BusinessCode.UNAUTHORIZED, message);
    }
}

// 无权限错误类，用户权限不足，禁止访问资源
export class ForbiddenException extends BaseException {
    constructor(message = "无权限访问") {
        super(BusinessCode.FORBIDDEN, message);
    }
}
