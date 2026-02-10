// 性别枚举
export enum GenderEnum {
    // 未知
    UNKNOWN = "0",
    // 男
    MALE = "1",
    // 女
    FEMALE = "2"
}

export interface SysUserInput {
    // 用户id
    userId?: string;
    // 用户名
    userName?: string;
    // 密码
    password?: string;
    // 昵称
    nickName?: string;
    // 手机号
    phone?: string;
    // 头像
    avatar?: string;
    // 性别
    gender?: GenderEnum;
    // 状态
    status?: boolean;
    // 角色id集合
    roleIds?: string[];
}
