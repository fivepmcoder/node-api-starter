import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "@/app/model/base-model";
import { SysUser } from "@/app/model/sys-user";
import { SysMenu } from "@/app/model/sys-menu";

@Entity({ comment: "角色" })
export class SysRole extends BaseModel {
    @PrimaryGeneratedColumn({ type: "bigint", comment: "角色id" })
    roleId?: string;

    @Column({ type: "varchar", length: 50, comment: "角色名称" })
    roleName?: string;

    @Column({ type: "varchar", length: 50, comment: "角色编码" })
    roleCode?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "角色描述" })
    roleDesc?: string;

    @Column({ type: "int", default: 0, comment: "显示顺序，升序" })
    sort: number = 0;

    @ManyToMany(() => SysUser, (user) => user.roles)
    users?: SysUser[];

    @ManyToMany(() => SysMenu, (menu) => menu.roles, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE",
        orphanedRowAction: "delete",
        createForeignKeyConstraints: false
    })
    @JoinTable()
    menus?: SysMenu[];
}
