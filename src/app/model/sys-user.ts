import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "@/app/model/base-model";
import { GenderEnum } from "@/app/schema/sys-user";
import { SysRole } from "@/app/model/sys-role";

@Entity({ comment: "用户" })
export class SysUser extends BaseModel {
    @PrimaryGeneratedColumn({ type: "bigint", comment: "用户id" })
    userId?: string;

    @Column({ type: "varchar", length: 50, comment: "用户名" })
    userName?: string;

    @Column({ type: "varchar", length: 200, comment: "密码" })
    password?: string;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "昵称" })
    nickName?: string;

    @Column({ type: "varchar", length: 20, nullable: true, comment: "手机号" })
    phone?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "头像" })
    avatar?: string;

    @Column({
        type: "char",
        length: 1,
        default: GenderEnum.UNKNOWN,
        comment: "性别：0-未知；1-男；2-女"
    })
    gender: GenderEnum = GenderEnum.UNKNOWN;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "最后登录ip" })
    loginIp?: string;

    @Column({ type: "datetime", length: 0, nullable: true, comment: "最后登录时间" })
    loginTime?: Date;

    @ManyToMany(() => SysRole, (role) => role.users, {
        cascade: ["insert", "update"],
        onDelete: "CASCADE",
        orphanedRowAction: "delete",
        createForeignKeyConstraints: false
    })
    @JoinTable()
    roles?: SysRole[];
}
