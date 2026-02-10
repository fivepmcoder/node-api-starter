import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ comment: "日志" })
export class SysLog {
    @PrimaryGeneratedColumn({ type: "bigint", comment: "日志id" })
    logId?: string;

    @Column({
        type: "varchar",
        length: 10,
        nullable: true,
        comment: "日志类型：login-登陆；create-新增；update-更新；delete-删除"
    })
    logType?: string;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "日志标题" })
    logTitle?: string;

    @Column({
        type: "varchar",
        length: 10,
        nullable: true,
        comment: "请求方式：get；post；put；delete"
    })
    requestMethod?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "方法名称" })
    methodName?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "请求路径" })
    apiUrl?: string;

    @Column({ type: "text", nullable: true, comment: "请求数据" })
    requestData?: string;

    @Column({ type: "text", nullable: true, comment: "响应数据" })
    responseData?: string;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "操作人" })
    userName?: string;

    @Column({ type: "varchar", length: 50, nullable: true, comment: "操作ip" })
    ip?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "ip归属地" })
    ipLocaltion?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "浏览器" })
    browser?: string;

    @Column({
        type: "char",
        length: 1,
        default: "0",
        comment: "状态：0-失败；1-成功",
        transformer: {
            to: (value: boolean) => (value ? "1" : "0"),
            from: (value: string) => value == "1"
        }
    })
    status: boolean = false;

    @Column({ type: "varchar", length: 500, nullable: true, comment: "消息" })
    message?: string;

    @Column({ type: "int", default: 0, comment: "执行耗时（毫秒）" })
    takeTime?: number;

    @Column({ type: "datetime", length: 0, comment: "请求时间" })
    requestTime?: Date;
}
