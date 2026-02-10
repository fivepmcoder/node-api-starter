import type { SysUserInput } from "@/app/schema/sys-user";
import { SysUser } from "@/app/model/sys-user";
import { Encryption } from "@/app/security/encryption";
import { BaseService } from "@/app/service/base-service";
import { SysRoleService } from "@/app/service/sys-role-service";

export class SysUserService extends BaseService<SysUser> {
    // 指定操作实体
    public static override async create(): Promise<SysUserService> {
        return BaseService.createInstance(SysUserService, SysUser);
    }

    // 创建用户
    async create(user: SysUserInput): Promise<boolean> {
        // 对密码进行加密
        if (user.password) {
            user.password = await Encryption.hash(user.password);
        }
        const sysUser: SysUser = this.repository.create(user);
        if (user.roleIds && user.roleIds.length > 0) {
            const sysRoleService = await SysRoleService.create();
            sysUser.roles = await sysRoleService.findByIds(user.roleIds);
        }

        return (await this.repository.save(sysUser)).userId != null;
    }

    // 通过用户id更新用户

    // 通过用户id查询用户
    async findById(userId: string): Promise<SysUser | null> {
        return this.repository.findOneBy({ userId });
    }

    // 通过用户名查询用户
    async findByUserName(userName: string): Promise<SysUser | null> {
        return this.repository.findOneBy({ userName });
    }

    // 通过用户id查询用户及其角色和菜单信息
    async findByIdWithRolesAndMenus(userId: string): Promise<SysUser | null> {
        return this.repository.findOne({
            where: { userId },
            relations: ["roles", "roles.menus"]
        });
    }
}
