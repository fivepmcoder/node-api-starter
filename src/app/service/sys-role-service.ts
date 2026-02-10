import { SysRole } from "@/app/model/sys-role";
import { BaseService } from "@/app/service/base-service";
import { In } from "typeorm";

export class SysRoleService extends BaseService<SysRole> {
    // 指定操作实体
    public static override async create(): Promise<SysRoleService> {
        return BaseService.createInstance(SysRoleService, SysRole);
    }

    // 根据角色id集合查询角色
    async findByIds(roleIds: string[]): Promise<SysRole[] | []> {
        return this.repository.findBy({ roleId: In(roleIds) });
    }
}
