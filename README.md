# PayOps

虚拟支付订单系统的粗糙版。

当前版本只做最小闭环：注册登录、JWT、记住我、用户购买 token 套餐、管理员维护套餐和查看订单。后面再逐步演进到稳定、高性能、高可用。

## 当前功能

- 两种角色：`ADMIN`、`USER`
- 注册即送 `10.00` 元现金余额
- JWT 登录；勾选“记住我”有效期 7 天，不勾选 2 小时
- 前端使用 localStorage 或 sessionStorage 持久化登录
- 用户商城：现金余额、token 余额、套餐购买、我的订单
- 管理员后台：新增/编辑/停用套餐、全部订单、用户列表
- 购买直接扣现金余额并增加 token，生成一条已支付订单
- 订单保存套餐快照，后续改价不影响历史订单

## 默认数据

启动时自动初始化：

| 账号 | 密码 | 角色 |
|---|---|---|
| `admin` | `admin123` | 管理员 |

| 套餐 | 售价 | 到账 |
|---|---|---|
| 1 元 token | ¥0.95 | 1.00 token |
| 5 元 token | ¥4.50 | 5.00 token |
| 10 元 token | ¥8.50 | 10.00 token |

管理员账号仅用于本地演示。正式环境请通过环境变量覆盖 `ADMIN_PASSWORD` 和 `JWT_SECRET`。

## 技术栈

- 后端：Java 17、Spring Boot 3.3、Spring Data JPA、MySQL 8
- 鉴权：JWT（jjwt）、BCrypt、HandlerInterceptor
- 前端：Vue 3、Vite、Vue Router
- 数据库：MySQL，当前使用 `ddl-auto=update` 自动建表

## 本地启动

### 1. MySQL

创建数据库和本地账号：

```sql
CREATE DATABASE IF NOT EXISTS payops
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'payops'@'localhost' IDENTIFIED BY 'payops';
GRANT ALL PRIVILEGES ON payops.* TO 'payops'@'localhost';
FLUSH PRIVILEGES;
```

默认连接配置：

```text
jdbc:mysql://localhost:3306/payops
username: payops
password: payops
```

可以通过 `DB_URL`、`DB_USERNAME`、`DB_PASSWORD` 覆盖。

### 2. 后端

```bash
cd backend
mvn spring-boot:run
```

后端地址：http://localhost:8080

健康检查：http://localhost:8080/api/health

### 3. 前端

```bash
cd frontend
npm install
npm run dev
```

前端地址：http://localhost:5173

Vite 会把 `/api` 代理到后端 `8080`。

## 测试

```bash
cd backend
mvn test
```

前端构建：

```bash
cd frontend
npm run build
```

## 主要接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/login` | 登录，返回 JWT |
| GET | `/api/auth/me` | 当前用户 |
| GET | `/api/products` | 可购买套餐 |
| POST | `/api/orders` | 购买套餐 |
| GET | `/api/orders/my` | 我的订单 |
| GET | `/api/admin/users` | 用户列表 |
| GET | `/api/admin/products` | 全部套餐 |
| POST | `/api/admin/products` | 新增套餐 |
| PUT | `/api/admin/products/{id}` | 修改套餐 |
| GET | `/api/admin/orders` | 全部订单 |

## 当前边界

- 不接真实支付
- 不做库存和超卖逻辑
- 不加 Redis、MQ、Docker、Nginx
- 不做并发控制、分布式事务和复杂权限
- 数据库自动建表，暂不使用 Flyway
