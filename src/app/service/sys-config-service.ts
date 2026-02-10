import { SysConfig } from "@/app/model/sys-config";
import { BaseService } from "@/app/service/base-service";

export class SysConfigService extends BaseService<SysConfig> {
    // 指定操作实体
    public static override async create(): Promise<SysConfigService> {
        return BaseService.createInstance(SysConfigService, SysConfig);
    }
}
