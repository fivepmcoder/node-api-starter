import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "@/app/model/base-model";
import { SysDictItem } from "@/app/model/sys-dict-item";

@Entity({ comment: "字典类型" })
export class SysDictType extends BaseModel {
    @PrimaryGeneratedColumn({ type: "bigint", comment: "类型id" })
    typeId?: string;

    @Column({ type: "varchar", length: 50, comment: "类型名称" })
    typeName?: string;

    @Column({ type: "varchar", length: 50, comment: "类型编码" })
    typeCode?: string;

    @Column({
        type: "char",
        length: 1,
        default: "0",
        comment: "是否锁定：0-否；1-是",
        transformer: {
            to: (value: boolean) => (value ? "1" : "0"),
            from: (value: string) => value == "1"
        }
    })
    locked: boolean = false;

    @Column({ type: "varchar", length: 500, nullable: true, comment: "备注" })
    remark?: string;

    @Column({ type: "int", default: 0, comment: "显示顺序，升序" })
    sort: number = 0;

    @OneToMany(() => SysDictItem, (item) => item.dictType, {
        cascade: true
    })
    dictItems?: SysDictItem[];
}
