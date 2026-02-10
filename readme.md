# 🚀 node-api-starter

> 基于 Hono 框架和 TypeORM 的现代化 Node.js 后端项目脚手架，提供完整的数据访问层、统一响应格式、中间件系统等企业级功能。

![TypeScript](https://img.shields.io/badge/TypeScript-v5.0-blue) ![Hono](https://img.shields.io/badge/Hono-v4.0-orange) ![TypeORM](https://img.shields.io/badge/TypeORM-v0.3-red) ![License](https://img.shields.io/badge/License-MIT-green) ![Node](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen)

---

## ✨ 核心特性

| 特性               | 说明                                                             |
| ------------------ | ---------------------------------------------------------------- |
| ⚡ **Hono 框架**   | 轻量高性能的 Web 框架，比 Express 快 4 倍                        |
| 🎨 **TypeScript**  | 完整类型定义和泛型支持，优秀的开发体验                           |
| 🎯 **统一响应**    | ResponseBuilder (别名 R) 链式调用，标准化 API 响应               |
| 🛡️ **异常处理**    | 统一异常体系，自动转换为标准响应格式                             |
| 🛡️ **中间件系统**  | Security、Validator、Auth 三大中间件，提供认证、验证、上下文管理 |
| 🔐 **Token 认证**  | 基于 Redis 的 Token 机制，支持签名验证和令牌撤销                 |
| 🔒 **安全加密**    | bcrypt 密码加密 + HMAC 签名，防止时序攻击                        |
| 🗄️ **BaseService** | 封装 TypeORM，支持事务、跨服务调用、自动初始化                   |
| 📦 **BaseModel**   | 软删除、审计字段、状态管理等通用能力                             |
| 🔄 **并发安全**    | 单例模式 + 初始化锁，防止重复连接                                |

---

## 🔑 核心概念

### 1. ResponseBuilder (R) - 统一响应

**设计理念**：标准化 API 响应格式，提供链式调用

```typescript
import { R } from "@/core";

// 成功响应（无数据）
return R.success().send(ctx);

// 成功响应（带数据）
return R.success({
    data: { id: 1, name: "John" }
}).send(ctx);

// 成功响应（自定义消息）
return R.success({
    message: "用户创建成功",
    data: user
}).send(ctx);

// 失败响应
return R.fail({
    message: "用户名已存在"
}).send(ctx);

// 失败响应（带错误数据）
return R.fail({
    message: "验证失败",
    data: { errors: ["邮箱格式不正确"] }
}).send(ctx);
```

**链式调用**：

```typescript
import { R } from "@/core";

// 设置 HTTP 状态码
return R.success({ data: user }).setStatus(201).send(ctx);

// 动态修改业务码和消息
return R.success()
    .setCode(BusinessCode.SUCCESS)
    .setMessage("操作完成")
    .setData({ count: 10 })
    .send(ctx);

// 条件响应
const builder = condition ? R.success({ data: result }) : R.fail({ message: "条件不满足" });
return builder.send(ctx);
```

**响应格式**：

```json
{
  "code": number,
  "message": string,
  "data": any
}
```

### 2. Exception - 异常处理体系

**设计理念**：所有业务级错误都继承自 `BaseException`，并由全局错误处理器转换为标准的 API 响应

```typescript
// 异常类型
ValidationException // 400 - 参数验证失败
UnauthorizedException // 401 - 未授权
ForbiddenException // 403 - 无权限

// 使用示例
if (!email) {
  throw new ValidationException('邮箱不能为空')
}

// 自动转换为响应
{
  "code": 10500,
  "message": "邮箱不能为空"
}
```

### 3. Security 中间件 - 统一安全控制

**设计理念**：提供认证、授权、日志记录的一站式解决方案

```typescript
import { security } from "@/app/middleware/security";

// 基础认证
app.get("/api/user/profile", security({ requireAuth: true }), async (ctx) => {
    const user = Auth.getCurrentUser();
    return R.success({ data: user }).send(ctx);
});

// 角色控制
app.post(
    "/api/admin/users",
    security({
        role: "admin",
        logTitle: "创建用户",
        logType: "create"
    }),
    async (ctx) => {
        // 只有 admin 角色可以访问
    }
);

// 权限控制
app.delete(
    "/api/users/:id",
    security({
        permission: "user:delete",
        excludeRole: "guest",
        logTitle: "删除用户",
        logType: "delete"
    }),
    async (ctx) => {
        // 需要 user:delete 权限，且不能是 guest 角色
    }
);
```

**配置选项**：

| 选项                | 类型                                        | 说明         |
| ------------------- | ------------------------------------------- | ------------ |
| `requireAuth`       | boolean                                     | 是否需要登录 |
| `role`              | string                                      | 角色白名单   |
| `excludeRole`       | string                                      | 角色黑名单   |
| `permission`        | string                                      | 权限白名单   |
| `excludePermission` | string                                      | 权限黑名单   |
| `logTitle`          | string                                      | 日志标题     |
| `logType`           | "login" \| "create" \| "update" \| "delete" | 日志类型     |

**核心能力**：

- 🔹 自动 Token 验证
- 🔹 角色和权限检查
- 🔹 自动记录操作日志
- 🔹 超级管理员豁免权限检查

### 4. Validator 中间件 - 请求验证

**设计理念**：基于 Valibot 的类型安全验证

```typescript
import { validator } from "@/app/middleware/validator";
import * as v from "valibot";

// 定义验证规则
const LoginSchema = v.object({
    userName: v.pipe(v.string(), v.minLength(3, "用户名至少3个字符")),
    password: v.pipe(v.string(), v.minLength(6, "密码至少6个字符"))
});

// 应用验证
app.post("/api/login", validator("json", LoginSchema), async (ctx) => {
    // 获取验证后的数据（类型安全）
    const { userName, password } = ctx.req.valid("json");
    // ...
});
```

**支持的验证目标**：

- `param` - 路径参数
- `query` - 查询参数
- `json` - JSON 请求体
- `form` - 表单数据

**核心能力**：

- 🔹 类型安全：完整的 TypeScript 类型推导
- 🔹 自动错误处理：验证失败自动抛出 `ValidationException`
- 🔹 友好提示：返回第一个验证错误的详细信息

### 5. Auth 中间件 - 用户上下文

**设计理念**：基于 AsyncLocalStorage 的请求级用户上下文

```typescript
import { Auth } from "@/app/middleware/auth";

// 在任何地方获取当前用户
const currentUser = Auth.getCurrentUser();

if (currentUser) {
    console.log(`当前用户：${currentUser.userName}`);
}
```

**核心能力**：

- 🔹 请求隔离：每个请求独立的用户上下文
- 🔹 全局访问：无需层层传递 user 对象
- 🔹 类型安全：完整的 `ApiUser` 类型定义

**使用场景**：

- 审计日志：自动记录操作人
- 数据过滤：根据用户权限过滤数据
- 业务逻辑：在 Service 层获取当前用户

### 6. Token - 认证机制

**设计理念**：基于 Redis 的无状态认证，支持签名防篡改

```
// Token 结构：tokenId.signature
// 示例：a1b2c3d4e5f6.7890abcdef1234567890
```

**工作流程**：

```
登录
 │
 ├─ 1. 生成 tokenId (UUID)
 │
 ├─ 2. 生成签名 (HMAC-SHA256)
 │
 ├─ 3. 拼接 token = tokenId.signature
 │
 └─ 4. 存储用户信息到 Redis (key: tokenId, ttl: 7200s)

验证
 │
 ├─ 1. 解析 token 获取 tokenId 和 signature
 │
 ├─ 2. 验证签名是否有效
 │
 ├─ 3. 从 Redis 获取用户信息
 │
 └─ 4. 返回 ApiUser 或抛出异常

登出
 │
 └─ 删除 Redis 中的用户信息
```

**安全特性**：

- 🔹 签名防篡改：HMAC-SHA256 签名
- 🔹 时序攻击防护：使用 `crypto.timingSafeEqual` 比较签名
- 🔹 自动过期：Redis TTL 机制
- 🔹 可撤销：支持主动登出

**使用示例**：

```typescript
import { Token } from "@/app/security/token";

const token = await Token.generateToken(apiUser);
```

### 7. Encryption - 加密工具

**设计理念**：提供密码加密和数据签名两大核心能力

```typescript
// 密码加密（bcrypt）
const hash = await Encryption.hash("password");
const isValid = await Encryption.verifyHash("password", hash);

// 数据签名（HMAC-SHA256）
const signature = Encryption.generateSignature("data");
const isValid = Encryption.verifySignature("data", signature);
```

**应用场景**：

- 🔹 密码存储：用户密码加密存储
- 🔹 Token 签名：防止 Token 被篡改
- 🔹 数据完整性：验证数据未被修改

### 8. BaseService - 数据访问层基类

**设计理念**：统一数据访问接口，提供事务和跨服务调用能力

```typescript
export class SysUserService extends BaseService<SysUser> {
    // 指定操作实体
    public static override async create(): Promise<SysUserService> {
        return BaseService.createInstance(SysUserService, SysUser);
    }

    // ✅ 自动获得 repository、manager、dataSource
    // ✅ 支持事务：transaction()
    // ✅ 支持跨服务调用：withService()

    // 通过用户id查询用户
    async findById(userId: string): Promise<SysUser | null> {
        return this.repository.findOneBy({ userId });
    }

    // 通过用户名查询用户
    async findByUserName(userName: string): Promise<SysUser | null> {
        return this.repository.findOneBy({ userName });
    }
}
```

**核心能力**：

- 🔹 自动初始化：通过静态工厂方法创建实例
- 🔹 事务支持：`transaction()` 方法自动管理事务上下文
- 🔹 跨服务调用：`withService()` 在同一事务中调用其他 Service
- 🔹 类型安全：完整的泛型支持

### 9. BaseModel - 实体基类

**设计理念**：提供通用字段和软删除能力

```typescript
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel } from "@/app/model/base-model";
import { SysUser } from "@/app/model/sys-user";
import { SysMenu } from "@/app/model/sys-menu";

@Entity({ comment: "角色" })
export class SysRole extends BaseModel {
    @PrimaryGeneratedColumn({ type: "bigint", comment: "角色id" })
    roleId?: string;

    // 自动继承以下字段：
    // - status: boolean (状态)
    // - createBy: string (创建人)
    // - createTime: Date (创建时间)
    // - updateBy: string (更新人)
    // - updateTime: Date (更新时间)
    // - deleteTime: Date (删除时间 - 软删除)
}
```

**核心能力**：

- 🔹 软删除：`@DeleteDateColumn` 实现逻辑删除
- 🔹 审计字段：自动记录创建人、更新人
- 🔹 状态管理：布尔值与字符串自动转换
- 🔹 时间戳：自动维护创建时间、更新时间

### 10. Redis 客户端

**基础操作**

```typescript
import { RedisClient } from "@/core";

const redis = await RedisClient.getInstance();
const cache = await redis
    .getClient()
    .setex(
        `${SYSTEM_CONSTANT.REDIS.API_USER_CACHE_NAME}${tokenId}`,
        env.TOKEN_EXPIRE_TIME,
        JSON.stringify(apiUser)
    );
```

---

## 📝 完整示例

### 用户登录接口

```typescript
import { Hono } from "hono";
import { validator } from "@/app/middleware/validator";
import { security } from "@/app/middleware/security";
import { R } from "@/core";
import * as v from "valibot";

const app = new Hono();

// 1. 定义验证规则
const LoginSchema = v.object({
    userName: v.pipe(v.string(), v.minLength(3)),
    password: v.pipe(v.string(), v.minLength(6))
});

// 2. 应用中间件
app.post(
    "/api/login",
    validator("json", LoginSchema),
    security({ logTitle: "用户登录", logType: "login" }),
    async (ctx) => {
        // 3. 获取验证后的数据
        const { userName, password } = ctx.req.valid("json");

        // 4. 业务逻辑
        const userService = await SysUserService.create();
        const user = await userService.findByUserName(userName);

        if (!user || !(await Encryption.verifyHash(password, user.password!))) {
            return R.fail({ message: "用户名或密码错误" }).send(ctx);
        }

        // 5. 生成 Token
        const token = await Token.generateToken({
            userId: user.userId!,
            userName: user.userName!,
            status: user.status!
        });

        // 6. 返回响应
        return R.success({
            data: { token },
            message: "登录成功"
        }).send(ctx);
    }
);
```

---

## 🚀 快速开始

### 1. 安装依赖

```
# 使用 npm
npm install

# 使用 pnpm
pnpm install
```

### 2. 环境配置

创建 `.env` 文件：

> `cp .env.example .env`

```
# 项目相关配置
APP_NAME=Api-Starter
APP_SECRET=abcdefghijklmnopqrstuvwxyz
APP_VERSION=0.1.0
APP_SSL=false
APP_DOMAIN=localhost:3000

# 开发环境配置
SERVER_HOST=localhost
SERVER_PORT=3000

# 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=app
MYSQL_USER_NAME=root
MYSQL_PASSWORD=root

# redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DATABASE=0
REDIS_PASSWORD=

# 令牌自定义标识
TOKEN_HEADER=Authorization
# 令牌有效期，单位：秒
TOKEN_EXPIRE_TIME=1800
```

### 3. 数据库初始化

```
# 导入数据库脚本
mysql -u root -p < api-starter.sql

# 或使用可视化工具导入 api-starter.sql
```

### 4. 启动项目

```
# 开发模式
npm run dev

# 生产构建
npm run build

# 生产运行
npm start
```

---

## 📁 项目结构

```
api-starter/
├── src/
│   ├── main.ts                 # 应用入口
│   │
│   ├── config/                 # 配置文件
│   │   ├── index.ts            # 配置导出
│   │   ├── console/            # 控制台配置
│   │   └── env/                # 环境变量配置
│   │
│   ├── app/                    # 应用层
│   │   ├── controller/         # 控制器层
│   │   ├── service/            # 业务逻辑层
│   │   ├── model/              # 数据模型层
│   │   ├── middleware/         # 中间件
│   │   ├── security/           # 安全相关
│   │   ├── exception/          # 异常处理
│   │   ├── subscriber/         # 事件订阅
│   │   └── schema/             # 类型定义
│   │
│   └── core/                   # 核心模块
│       ├── index.ts            # 核心导出
│       ├── dal/                # 数据访问层
│       └── response/           # 响应封装
│
├── .env.example                # 环境变量示例
├── api-starter.sql             # 数据库初始化脚本
├── package.json                # 项目依赖
├── tsconfig.json               # TypeScript 配置
```

---

## 🛠️ 技术栈

| 类别   | 技术       |
| ------ | ---------- |
| 运行时 | Node.js    |
| 框架   | Hono       |
| 语言   | TypeScript |
| ORM    | TypeORM    |
| 数据库 | MySQL      |
| 缓存   | Redis      |
| 验证   | Valibot    |
| 加密   | bcrypt     |

---

## 🤝 贡献指南

欢迎所有形式的贡献！无论是报告 Bug、提出新功能建议，还是提交代码改进。

### 如何贡献

1. **Fork 本仓库**

    点击右上角的 "Fork" 按钮，将项目复制到你的 GitHub 账户

2. **克隆到本地**

    ```
    git clone https://github.com/fivepmcoder/node-api-starter.git
    cd node-api-starter
    ```

3. **创建特性分支**

    ```
    # 功能开发
    git checkout -b feature/your-feature-name

    # Bug 修复
    git checkout -b fix/your-bug-fix

    # 文档更新
    git checkout -b docs/your-doc-update
    ```

4. **进行开发**
    - 遵循项目现有的代码风格
    - 添加必要的注释和文档
    - 如果是新功能，请更新 README

5. **提交更改**

    ```
    git add .
    git commit -m "feat: 添加新功能描述"

    # 提交信息规范：
    # feat: 新功能
    # fix: Bug 修复
    # docs: 文档更新
    # style: 代码格式调整
    # refactor: 代码重构
    # test: 测试相关
    # chore: 构建/工具链相关
    ```

6. **推送到 GitHub**

    ```
    git push origin feature/your-feature-name
    ```

7. **创建 Pull Request**
    - 在 GitHub 上打开你的 Fork 仓库

    - 点击 "New Pull Request" 按钮

    - 填写 PR 标题和详细描述：
        - 说明改动的目的和内容
        - 如果修复了 Issue，请关联对应的 Issue 编号
        - 附上测试截图或日志（如适用）

    - 等待维护者审核

### 代码规范

- ✅ 使用 TypeScript 编写代码
- ✅ 保持代码简洁、可读

### 报告问题

如果你发现了 Bug 或有功能建议，请：

1. 在 [Issues](https://github.com/fivepmcoder/node-api-starter/issues) 中搜索是否已有相关问题

2. 如果没有，创建新的 Issue，并提供：
    - 清晰的标题
    - 详细的问题描述
    - 复现步骤（如果是 Bug）
    - 期望的行为
    - 环境信息（Node.js 版本、操作系统等）

---

## ⚠️ 免责声明

> **重要提示**：本项目为个人学习和研究项目，**未经过企业级生产环境验证**。

### 使用须知

- 🔸 本项目仅供学习、研究和参考使用
- 🔸 不建议直接用于生产环境，除非经过充分测试和评估
- 🔸 使用本项目代码所产生的任何问题，作者不承担责任
- 🔸 建议在使用前进行全面的安全审计和性能测试

### 生产环境使用建议

如果你计划在生产环境中使用本项目，请务必：

1. **安全审计**
    - 审查所有安全相关代码
    - 检查依赖包的安全漏洞
    - 实施额外的安全措施（如 WAF、限流等）

2. **性能测试**
    - 进行压力测试和负载测试
    - 优化数据库查询和索引
    - 配置合理的连接池大小

3. **监控和日志**
    - 添加完善的日志系统
    - 配置应用监控和告警
    - 实施错误追踪机制

4. **备份和恢复**
    - 制定数据备份策略
    - 测试灾难恢复流程
    - 准备应急预案

### 已知限制

- ⚠️ 缺少完整的单元测试和集成测试
- ⚠️ 未进行大规模并发测试
- ⚠️ 部分功能可能需要根据实际业务调整
- ⚠️ 文档可能存在不完善之处

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

这意味着你可以：

- ✅ 自由使用、复制、修改、合并、发布、分发本软件
- ✅ 用于商业或非商业目的
- ✅ 在遵守协议的前提下，可以闭源使用

但需要：

- 📌 在软件和文档中保留版权声明和许可声明
- 📌 软件按"原样"提供，不提供任何形式的担保

---

## 📮 联系方式

- 🐛 Issues: [GitHub Issues](https://github.com/fivepmcoder/node-api-starter/issues)

---

**如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！**

Made with ❤️ by [Zero](https://github.com/fivepmcoder)
