import {
    EventSubscriber,
    type EntitySubscriberInterface,
    type InsertEvent,
    type UpdateEvent
} from "typeorm";
import { BaseModel } from "@/app/model/base-model";
import { Auth } from "@/app/middleware/auth";

@EventSubscriber()
// @ts-expect-error - TypeORM 装饰器自动注册，类不需要显式使用
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BaseModelSubscriber implements EntitySubscriberInterface<BaseModel> {
    // 监听模型
    listenTo(): typeof BaseModel | string {
        return BaseModel;
    }

    // 插入自动设置创建数据
    beforeInsert(event: InsertEvent<BaseModel>): void {
        if (!event.entity) {
            return;
        }
        const apiUser = Auth.getCurrentUser();
        if (apiUser) {
            event.entity["createBy"] = apiUser.userName || "system";
            event.entity["updateBy"] = apiUser.userName || "system";
        }
    }

    // 更新自动设置更新数据
    beforeUpdate(event: UpdateEvent<BaseModel>): void {
        if (!event.entity) {
            return;
        }
        const apiUser = Auth.getCurrentUser();
        event.entity["updateBy"] = (apiUser && apiUser.userName) || "system";
    }
}
