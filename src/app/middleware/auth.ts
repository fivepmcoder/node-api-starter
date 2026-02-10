import { AsyncLocalStorage } from "async_hooks";
import { type ApiUser } from "@/app/schema/system";

export class Auth {
    // 用户上下文
    public static userContext = new AsyncLocalStorage<ApiUser>();

    // 从请求上下文中获取当前用户
    public static getCurrentUser(): ApiUser | undefined {
        return this.userContext.getStore();
    }
}
