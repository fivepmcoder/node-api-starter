import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "@/app/model/base-model";
import { ConfigTypeEnum, ValueTypeEnum } from "@/app/schema/sys-config";

@Entity({ comment: "配置" })
export class SysConfig extends BaseModel {
    @PrimaryGeneratedColumn({ type: "bigint", comment: "配置id" })
    configId?: string;

    @Column({
        type: "char",
        length: 1,
        default: ConfigTypeEnum.SYSTEM,
        comment: "配置类型：1-系统配置；2-业务配置"
    })
    configType: string = ConfigTypeEnum.SYSTEM;

    @Column({ type: "varchar", length: 50, comment: "配置名称" })
    configName?: string;

    @Column({ type: "varchar", length: 50, comment: "配置键" })
    configKey?: string;

    @Column({ type: "text", comment: "配置值" })
    configValue?: string;

    @Column({
        type: "char",
        length: 1,
        default: ValueTypeEnum.PLAIN_TEXT,
        comment: "值类型：1-普通文本；2-富文本；3-url"
    })
    valueType: string = ValueTypeEnum.PLAIN_TEXT;

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
}
