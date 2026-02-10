import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "@/app/model/base-model";
import { SysDictType } from "@/app/model/sys-dict-type";

@Entity({ comment: "字典项" })
export class SysDictItem extends BaseModel {
    @PrimaryGeneratedColumn({ type: "bigint", comment: "字典项id" })
    itemId?: string;

    @Column({ type: "varchar", length: 50, comment: "字典类型编码" })
    typeCode?: string;

    @Column({ type: "varchar", length: 100, comment: "字典项标签" })
    itemLabel?: string;

    @Column({ type: "varchar", length: 200, comment: "字典项值" })
    itemValue?: string;

    @Column({ type: "varchar", length: 500, nullable: true, comment: "字典项描述" })
    itemDesc?: string;

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

    @ManyToOne(() => SysDictType, (type) => type.dictItems, {
        onDelete: "CASCADE",
        createForeignKeyConstraints: false
    })
    @JoinColumn({ name: "type_code", referencedColumnName: "typeCode" })
    dictType?: SysDictType;
}
