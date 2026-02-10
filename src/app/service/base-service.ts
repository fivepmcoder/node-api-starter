import {
    DataSource,
    EntityManager,
    Repository,
    type EntityTarget,
    type ObjectLiteral
} from "typeorm";
import { OrmClient } from "@/core";

export abstract class BaseService<T extends ObjectLiteral> {
    // 仓库，用于操作实体数据
    private _repository: Repository<T> | undefined;

    // 实体管理器，用于操作事务等
    private _manager: EntityManager | undefined;

    // 数据源，用于操作数据库
    private _dataSource: DataSource | undefined;

    // 客户端实例
    private _ormClient: OrmClient | undefined;

    // 要求子类提供实体类
    protected entity?: EntityTarget<T>;

    // 基类的 create 方法，抛出错误提示子类必须实现
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static create(..._args: unknown[]): Promise<BaseService<ObjectLiteral>> {
        throw new Error(`${this.name} must implement static create() method`);
    }

    // 初始化 dataSource、manager、repository
    private async initialize(): Promise<void> {
        if (!this.entity) {
            throw new Error(
                `${this.constructor.name}: entity not set. please pass entity to create() method`
            );
        }

        const orm = await OrmClient.getInstance();
        this._ormClient = orm;
        this._dataSource = orm.getDataSource();
        this._manager = this._dataSource.manager;
        this._repository = this._dataSource.getRepository(this.entity);
    }

    // 静态工厂方法，初始化实例
    // ServiceClass 子类
    // entity 实体类
    // _args 子类的 create 方法参数
    protected static async createInstance<
        S extends BaseService<ObjectLiteral>,
        T extends ObjectLiteral,
        Args extends readonly unknown[] = []
    >(
        ServiceClass: {
            new (): S;
            create(...args: Args): Promise<S>;
        },
        entity: EntityTarget<T>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ..._args: Args
    ): Promise<S> {
        if (!("create" in ServiceClass) || typeof ServiceClass.create != "function") {
            throw new Error(`${ServiceClass.name} must implement static create() method`);
        }

        const instance = Reflect.construct(ServiceClass, []) as S;
        instance.entity = entity;
        await instance.initialize();

        return instance;
    }

    // 获取 repository
    public get repository(): Repository<T> {
        if (!this._repository) {
            throw new Error(
                "service not initialized, please use YourService.create() to instantiate"
            );
        }
        return this._repository;
    }

    // 获取 manager
    public get manager(): EntityManager {
        if (!this._manager) {
            throw new Error(
                "Service not initialized, please use YourService.create() to instantiate"
            );
        }
        return this._manager;
    }

    // 获取 dataSource
    public get dataSource(): DataSource {
        if (!this._dataSource) {
            throw new Error(
                "service not initialized, please use YourService.create() to instantiate"
            );
        }
        return this._dataSource;
    }

    // 执行事务
    // fn 事务函数
    protected async transaction<R>(fn: (manager: EntityManager) => Promise<R>): Promise<R> {
        return this.dataSource.transaction(async (manager) => {
            const originalManager = this._manager;
            this._manager = manager;
            try {
                return await fn(manager);
            } finally {
                this._manager = originalManager;
            }
        });
    }

    // 在当前事务中调用其他 Service
    // ServiceClass 子类
    // fn 函数
    // args 参数
    // manager 事务管理器
    protected async withService<S extends BaseService<ObjectLiteral>, R, A extends unknown[] = []>(
        ServiceClass: new (...args: A) => S,
        fn: (service: S) => Promise<R>,
        args?: A,
        manager?: EntityManager
    ): Promise<R> {
        const service = new ServiceClass(...(args || ([] as unknown as A)));
        await (service as unknown as { initialize(): Promise<void> }).initialize();
        if (manager) {
            service.setManager(manager);
        }
        return fn(service);
    }

    // 设置实体管理器
    protected setManager(manager: EntityManager): void {
        this._manager = manager;
    }

    // 关闭数据库连接
    // 用于进程退出或手动释放资源
    public async close(): Promise<void> {
        if (this._ormClient) {
            await this._ormClient.close();
            this._ormClient = undefined;
            this._repository = undefined;
            this._manager = undefined;
            this._dataSource = undefined;
        }
    }
}
