import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseModel {
    @Column({
        type: "char",
        length: 1,
        default: "1",
        comment: "状态：0-禁用；1-正常",
        transformer: {
            to: (value: boolean) => (value ? "1" : "0"),
            from: (value: string) => value == "1"
        }
    })
    status: boolean = true;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "创建人" })
    createBy?: string;

    @CreateDateColumn({ type: "datetime", length: 0, nullable: true, comment: "创建时间" })
    createTime?: Date;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "更新人" })
    updateBy?: string;

    @UpdateDateColumn({ type: "datetime", length: 0, nullable: true, comment: "更新时间" })
    updateTime?: Date;

    @DeleteDateColumn({ type: "datetime", length: 0, nullable: true, comment: "删除时间" })
    deleteTime?: Date;
}
