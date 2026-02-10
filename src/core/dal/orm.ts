// import "reflect-metadata";
import {
    DataSource,
    DefaultNamingStrategy,
    type DataSourceOptions,
    type NamingStrategyInterface
} from "typeorm";

export class OrmClient {
    // 默认实例 key
    public static readonly instanceDefaultKey = "main";

    // 已创建实例集合
    private static instance: Map<string, OrmClient> = new Map();

    // 初始化锁，防止高并发创建重复实例
    private static initLock: Map<string, Promise<OrmClient>> = new Map();

    // 数据库连接
    private dataSource?: DataSource | undefined;

    // 初始化状态
    private initializing?: Promise<DataSource> | undefined;

    // 关闭状态
    private closing = false;

    private constructor(
        private key: string,
        private config: DataSourceOptions
    ) {}

    // 获取创建实例
    public static async getInstance(data?: {
        instanceKey?: string;
        config?: DataSourceOptions;
    }): Promise<OrmClient> {
        const { instanceKey, config } = data || {};
        const key = instanceKey || OrmClient.instanceDefaultKey;
        // 检查实例集合里是否已有初始化完成的实例
        const existing = OrmClient.instance.get(key);
        if (existing != null) {
            // 如果已有实例，保证 init 完成后返回
            await existing.init();
            return existing;
        }

        // 检查是否已有正在初始化的 Promise
        const pending = OrmClient.initLock.get(key);
        if (pending != null) {
            // 并发请求直接返回同一个初始化 Promise
            return pending;
        }

        if (config == null) {
            throw new Error(`orm for instance key ${key} not initialized, configuration required`);
        }

        // 创建新的初始化 Promise
        const initPromise = (async () => {
            try {
                // 创建 OrmClient 实例
                const orm = new OrmClient(key, {
                    ...config,
                    namingStrategy: config.namingStrategy || new NamingStrategy()
                });
                // 初始化 DataSource
                await orm.init();
                // 保存到单例集合
                OrmClient.instance.set(key, orm);
                return orm;
            } finally {
                // 初始化完成后，从锁集合中删除
                OrmClient.initLock.delete(key);
            }
        })();

        // 保存到初始化锁集合，防止并发重复创建
        OrmClient.initLock.set(key, initPromise);
        return initPromise;
    }

    // 初始化数据库连接
    public async init(): Promise<DataSource> {
        // 如果已经有 dataSource，直接返回
        if (this.dataSource != null) {
            return this.dataSource;
        }

        // 如果初始化 Promise 不存在，创建新的初始化流程
        if (this.initializing == null) {
            this.initializing = (async (): Promise<DataSource> => {
                try {
                    // 创建 TypeORM DataSource
                    const dataSource = new DataSource(this.config);
                    // 初始化 DataSource，建立数据库连接
                    const initialized = await dataSource.initialize();
                    // 保存到实例属性
                    this.dataSource = initialized;
                    return this.dataSource;
                } catch (err) {
                    // 初始化失败，重置初始化状态
                    this.initializing = undefined;
                    throw err;
                }
            })();
        }

        // 返回初始化 Promise
        return this.initializing;
    }

    // 检查实例是否已初始化
    public static hasInstance(instanceKey?: string): boolean {
        return OrmClient.instance.has(instanceKey || OrmClient.instanceDefaultKey);
    }

    // 获取数据库连接
    public getDataSource(): DataSource {
        if (this.dataSource == null) {
            throw new Error(`orm not initialized for instance key ${this.key}, call init first`);
        }
        return this.dataSource;
    }

    // 关闭数据库连接
    public async close(): Promise<void> {
        // 如果正在关闭或尚未初始化，直接返回
        if (this.closing || this.dataSource == null) {
            return;
        }
        // 标记正在关闭
        this.closing = true;

        try {
            // 如果 DataSource 已初始化，则销毁连接
            if (this.dataSource.isInitialized) {
                await this.dataSource.destroy();
            }
        } finally {
            // 清理内部状态
            this.dataSource = undefined;
            this.initializing = undefined;
            this.closing = false;
            // 从实例集合中删除
            OrmClient.instance.delete(this.key);
        }
    }
}

// 自定义命名策略配置
interface NamingStrategyConfig {
    // 是否移除多对多中间表的重复前缀（如 sys_user_sys_role → sys_user_role）
    removeCommonPrefix?: boolean;

    // 自定义表名前缀
    tablePrefix?: string;

    // 是否在外键列名中包含关系名（如 dict_type_id 而不是 type_id）
    includeRelationInForeignKey?: boolean;

    // 自定义列名转换函数
    customColumnTransform?: (columnName: string) => string;
}

// 命名策略
class NamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    private options: Required<NamingStrategyConfig>;
    constructor(options: NamingStrategyConfig = {}) {
        super();

        // 设置默认值
        this.options = {
            removeCommonPrefix: options.removeCommonPrefix || true,
            tablePrefix: options.tablePrefix || "",
            includeRelationInForeignKey: options.includeRelationInForeignKey || false,
            customColumnTransform: options.customColumnTransform || ((name) => name)
        };
    }

    // 属性名转列名
    // userName → user_name
    override columnName(
        propertyName: string,
        customName: string,
        embeddedPrefixes: string[]
    ): string {
        const name = customName || propertyName;
        if (embeddedPrefixes.length > 0) {
            const prefix = this.snakeCase(embeddedPrefixes.join("_"));
            const column = customName || this.snakeCase(name);
            return this.options.customColumnTransform(prefix + "_" + column);
        }
        const columnName = customName || this.snakeCase(name);
        return this.options.customColumnTransform(columnName);
    }

    // 类名转表名
    // SysUser → sys_user 或 prefix_sys_user
    override tableName(className: string, customName: string): string {
        if (customName != null) {
            return this.addTablePrefix(customName);
        }

        const tableName = this.snakeCase(className);
        return this.addTablePrefix(tableName);
    }

    // 外键列名
    // includeRelationInForeignKey=false: (dictType, typeId) → type_id
    // includeRelationInForeignKey=true:  (dictType, typeId) → dict_type_type_id
    override joinColumnName(relationName: string, referencedColumnName: string): string {
        if (this.options.includeRelationInForeignKey) {
            return this.snakeCase(`${relationName}_${referencedColumnName}`);
        }
        return this.snakeCase(referencedColumnName);
    }

    // 多对多中间表名
    // removeCommonPrefix=false: sys_user + sys_role → sys_user_sys_role
    // removeCommonPrefix=true:  sys_user + sys_role → sys_user_role
    override joinTableName(firstTableName: string, secondTableName: string): string {
        if (this.options.removeCommonPrefix) {
            const prefix = this.extractCommonPrefix(firstTableName, secondTableName);

            if (prefix) {
                const first = firstTableName.substring(prefix.length);
                const second = secondTableName.substring(prefix.length);
                return `${prefix}${first}_${second}`;
            }
        }

        return this.snakeCase(`${firstTableName}_${secondTableName}`);
    }

    // 中间表列名
    // sys_user，userId，user_id → user_id
    override joinTableColumnName(
        tableName: string,
        propertyName: string,
        columnName?: string
    ): string {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (void tableName, columnName);
        return this.snakeCase(propertyName);
    }

    // 关系的逆向列名，用于多对多关系
    override joinTableInverseColumnName(
        tableName: string,
        propertyName: string,
        columnName?: string
    ): string {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (void tableName, columnName);
        return this.snakeCase(propertyName);
    }

    // 添加表名前缀
    private readonly addTablePrefix = (tableName: string): string => {
        if (this.options.tablePrefix) {
            return `${this.options.tablePrefix}${tableName}`;
        }
        return tableName;
    };

    // 提取两个表名的公共前缀
    // 例如：sys_user 和 sys_role，返回 sys_
    private readonly extractCommonPrefix = (str1: string, str2: string): string => {
        const parts1 = str1.split("_");
        const parts2 = str2.split("_");
        const commonParts: string[] = [];
        const minLength = Math.min(parts1.length - 1, parts2.length - 1);
        for (let i = 0; i < minLength; i++) {
            const part1 = parts1[i];
            const part2 = parts2[i];
            if (typeof part1 === "string" && typeof part2 === "string" && part1 === part2) {
                commonParts.push(part1);
            } else {
                break;
            }
        }
        return commonParts.length > 0 ? commonParts.join("_") + "_" : "";
    };

    // 将字符串转换为蛇形命名法
    private readonly snakeCase = (str: string): string => {
        return str
            .replace(/([a-z\d])([A-Z])/g, "$1_$2")
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1_$2")
            .toLowerCase();
    };
}
