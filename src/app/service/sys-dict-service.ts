import { SysDictItem } from "@/app/model/sys-dict-item";
import { SysDictType } from "@/app/model/sys-dict-type";
import { BaseService } from "@/app/service/base-service";

export class SysDictTypeService extends BaseService<SysDictType> {
    // 指定操作实体
    public static override async create(): Promise<SysDictTypeService> {
        return BaseService.createInstance(SysDictTypeService, SysDictType);
    }
}

export class SysDictItemService extends BaseService<SysDictItem> {
    // 指定操作实体
    public static override async create(): Promise<SysDictItemService> {
        return BaseService.createInstance(SysDictItemService, SysDictItem);
    }
}
