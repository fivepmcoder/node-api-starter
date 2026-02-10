import { BaseService } from "@/app/service/base-service";
import { SysLog } from "@/app/model/sys-log";
import type { SysLogInput } from "@/app/schema/sys-log";

export class SysLogService extends BaseService<SysLog> {
    // 指定操作实体
    public static override async create(): Promise<SysLogService> {
        return BaseService.createInstance(SysLogService, SysLog);
    }

    // 插入日志
    async insert(sysLogInput: SysLogInput | undefined): Promise<boolean> {
        if (!sysLogInput) {
            return false;
        }
        return !!(await this.repository.insert(sysLogInput));
    }
}
