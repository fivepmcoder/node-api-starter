import { OrmClient } from "@/core/dal/orm";
import { RedisClient } from "@/core/dal/redis";
import type { RedisOptions } from "ioredis";
import type { DataSourceOptions } from "typeorm";

interface OrmConfig extends Pick<
    DataSourceOptions,
    | "poolSize"
    | "extra"
    | "entities"
    | "subscribers"
    | "entityPrefix"
    | "entitySkipConstructor"
    | "namingStrategy"
    | "migrations"
    | "migrationsRun"
    | "migrationsTableName"
    | "migrationsTransactionMode"
    | "synchronize"
    | "dropSchema"
    | "logging"
    | "logger"
    | "maxQueryExecutionTime"
    | "cache"
    | "metadataTableName"
    | "isolateWhereStatements"
> {
    type: DataSourceOptions["type"];
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    invalidWhereValuesBehavior?: {
        null?: "ignore" | "sql-null" | "throw";
        undefined?: "ignore" | "throw";
    };
}

interface RedisConfig {
    host: string;
    port: number;
    database?: number;
    password?: string;
}

interface DalConfig {
    ormConfig?: OrmConfig;
    redisConfig?: RedisConfig;
}

export { OrmClient, RedisClient };

// 初始化数据访问层
export const dalInit = async (dalConfig: DalConfig) => {
    if (dalConfig.ormConfig) {
        await OrmClient.getInstance({ config: buildDataSourceOptions(dalConfig.ormConfig) });
    }
    if (dalConfig.redisConfig) {
        await RedisClient.getInstance({ config: buildRedisOptions(dalConfig.redisConfig) });
    }
};

// 关闭数据访问层
export const dalClose = async () => {
    if (OrmClient.hasInstance()) {
        await (await OrmClient.getInstance()).close();
    }
    if (RedisClient.hasInstance()) {
        await (await RedisClient.getInstance()).close();
    }
};

// 构造 orm 配置对象
const buildDataSourceOptions = (config: OrmConfig): DataSourceOptions => {
    const entities = config.entities || ["src/app/model/*.ts"];
    const subscribers = config.subscribers || ["src/app/subscriber/*.ts"];
    const migrations = config.migrations || ["src/app/migration/*.ts"];

    return {
        ...config,
        entities,
        subscribers,
        migrations
    } as DataSourceOptions;
};

// 构建 redis 配置对象
const buildRedisOptions = (config: RedisConfig): RedisOptions => {
    return {
        ...config,
        db: config.database || 0
    } as RedisOptions;
};
