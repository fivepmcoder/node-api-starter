import Redis, { type RedisOptions } from "ioredis";

export class RedisClient {
    // 默认实例 key
    public static readonly instanceDefaultKey = "main";

    // 已创建实例集合
    private static instance: Map<string, RedisClient> = new Map();

    // 初始化锁，防止高并发创建重复实例
    private static initLock: Map<string, Promise<RedisClient>> = new Map();

    // redis 客户端
    private client?: Redis | undefined;

    // 初始化状态
    private initializing?: Promise<Redis> | undefined;

    // 关闭状态
    private closing = false;

    private constructor(
        private key: string,
        private config: RedisOptions
    ) {}

    // 获取创建实例
    // instanceKey 实例 key
    // config 配置对象
    public static async getInstance(data?: {
        instanceKey?: string;
        config?: RedisOptions;
    }): Promise<RedisClient> {
        const { instanceKey, config } = data || {};
        const key = instanceKey || RedisClient.instanceDefaultKey;
        // 检查实例集合里是否已有初始化完成的实例
        const existing = RedisClient.instance.get(key);
        if (existing != null) {
            // 如果已有实例，保证 init 完成后返回
            await existing.init();
            return existing;
        }

        // 检查是否已有正在初始化的 Promise
        const pending = RedisClient.initLock.get(key);
        if (pending != null) {
            // 并发请求直接返回同一个初始化 Promise
            return pending;
        }

        if (config == null) {
            throw new Error(
                `redis client for instance key ${key} not initialized, configuration required`
            );
        }

        // 创建新的初始化 Promise
        const initPromise = (async () => {
            try {
                // 创建 RedisClient 实例
                const redis = new RedisClient(key, config);
                // 初始化 Redis 连接
                await redis.init();
                // 保存到实例集合
                RedisClient.instance.set(key, redis);
                return redis;
            } finally {
                // 初始化完成后，从锁集合中删除
                RedisClient.initLock.delete(key);
            }
        })();

        // 保存到初始化锁集合，防止并发重复创建
        RedisClient.initLock.set(key, initPromise);
        return initPromise;
    }

    // 初始化连接
    public async init(): Promise<Redis> {
        // 如果客户端已存在，直接返回
        if (this.client != null) {
            return this.client;
        }

        // 如果初始化 Promise 不存在，创建新的初始化流程
        if (this.initializing == null) {
            this.initializing = (async (): Promise<Redis> => {
                let client: Redis | undefined;
                try {
                    if (this.config.db != null) {
                        if (this.config.db < 0 || this.config.db > 15) {
                            throw new Error(
                                `redis db must be between 0 and 15, got ${this.config.db}`
                            );
                        }
                    }
                    // 创建 ioredis 客户端
                    client = new Redis(this.config);
                    // 等待连接就绪或超时
                    await new Promise<void>((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(
                                new Error(
                                    `redis connection timeout after 5000 ms for instance key ${this.key}`
                                )
                            );
                        }, 5000);

                        if (client) {
                            client.once("ready", () => {
                                clearTimeout(timeout);
                                resolve();
                            });

                            client.once("error", (err) => {
                                clearTimeout(timeout);
                                reject(err);
                            });
                        }
                    });
                    // 初始化成功，保存客户端
                    this.client = client;
                    return this.client;
                } catch (err) {
                    // 初始化失败，重置初始化状态
                    this.initializing = undefined;
                    if (client != null) {
                        try {
                            await client.quit();
                        } catch {
                            // 忽略关闭错误
                        }
                    }
                    throw err;
                }
            })();
        }

        // 返回初始化 Promise
        return this.initializing;
    }

    // 检查实例是否已初始化
    public static hasInstance(instanceKey?: string): boolean {
        return RedisClient.instance.has(instanceKey || RedisClient.instanceDefaultKey);
    }

    // 获取已初始化客户端
    public getClient(): Redis {
        if (this.client == null) {
            throw new Error(
                `redis client not initialized for instance key ${this.key}, call init first`
            );
        }
        return this.client;
    }

    // 关闭客户端
    public async close(): Promise<void> {
        // 如果正在关闭或未初始化，直接返回
        if (this.closing || this.client == null) {
            return;
        }
        // 标记正在关闭
        this.closing = true;

        try {
            // 调用 ioredis quit 关闭连接
            await this.client.quit();
        } finally {
            // 清理内部状态
            this.client = undefined;
            this.initializing = undefined;
            this.closing = false;
            // 从实例集合中删除
            RedisClient.instance.delete(this.key);
        }
    }
}
