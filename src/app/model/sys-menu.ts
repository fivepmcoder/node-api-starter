import {
    Column,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { BaseModel } from "@/app/model/base-model";
import { MenuTypeEnum } from "@/app/schema/sys-menu";
import { SysRole } from "@/app/model/sys-role";

@Entity({ comment: "菜单" })
export class SysMenu extends BaseModel {
    @PrimaryGeneratedColumn({ type: "bigint", comment: "菜单id" })
    menuId?: string;

    @Column({ type: "bigint", default: 0, comment: "父级id" })
    parentId?: string;

    @Column({ type: "char", length: 1, comment: "菜单类型：C-目录；M-菜单；B-按钮" })
    menuType?: MenuTypeEnum;

    @Column({ type: "varchar", length: 50, comment: "菜单名称" })
    menuName?: string;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "组件名称" })
    name?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "路由地址" })
    path?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "组件路径" })
    component?: string;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "权限标识" })
    permission?: string;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "图标" })
    icon?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "外部链接" })
    link?: string;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "文本徽章" })
    badge?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "激活路径" })
    activePath?: string;

    @Column({
        type: "char",
        length: 1,
        default: "0",
        comment: "页面缓存：0-否；1-是",
        transformer: {
            to: (value: boolean) => (value ? "1" : "0"),
            from: (value: string) => value == "1"
        }
    })
    cache: boolean = false;

    @Column({
        type: "char",
        length: 1,
        default: "0",
        comment: "隐藏菜单：0-否；1-是",
        transformer: {
            to: (value: boolean) => (value ? "1" : "0"),
            from: (value: string) => value == "1"
        }
    })
    hideMenu: boolean = false;

    @Column({
        type: "char",
        length: 1,
        default: "0",
        comment: "是否内嵌：0-否；1-是",
        transformer: {
            to: (value: boolean) => (value ? "1" : "0"),
            from: (value: string) => value == "1"
        }
    })
    iframe: boolean = false;

    @Column({
        type: "char",
        length: 1,
        default: "0",
        comment: "固定标签：0-否；1-是",
        transformer: {
            to: (value: boolean) => (value ? "1" : "0"),
            from: (value: string) => value == "1"
        }
    })
    fixedTag: boolean = false;

    @Column({
        type: "char",
        length: 1,
        default: "0",
        comment: "隐藏标签：0-否；1-是",
        transformer: {
            to: (value: boolean) => (value ? "1" : "0"),
            from: (value: string) => value == "1"
        }
    })
    hideTag: boolean = false;

    @Column({
        type: "char",
        length: 1,
        default: "0",
        comment: "全屏页面：0-否；1-是",
        transformer: {
            to: (value: boolean) => (value ? "1" : "0"),
            from: (value: string) => value == "1"
        }
    })
    fullPage: boolean = false;

    @Column({ type: "int", default: 0, comment: "显示顺序，升序" })
    sort: number = 0;

    @ManyToOne(() => SysMenu, (menu) => menu.children, {
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: "parent_id", referencedColumnName: "menuId" })
    parent?: SysMenu;

    @OneToMany(() => SysMenu, (menu) => menu.parent)
    children?: SysMenu[];

    @ManyToMany(() => SysRole, (role) => role.menus)
    roles?: SysRole[];
}
