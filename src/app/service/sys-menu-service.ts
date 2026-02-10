import { SysMenu } from "@/app/model/sys-menu";
import { BaseService } from "@/app/service/base-service";

export class SysMenuService extends BaseService<SysMenu> {
    // 指定操作实体
    public static override async create(): Promise<SysMenuService> {
        return BaseService.createInstance(SysMenuService, SysMenu);
    }
}
