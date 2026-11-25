# PayOps 浏览器操作日志

## 1. 文档信息

| 项目 | 内容 |
|---|---|
| 文档编号 | PAYOPS-ACC-1.0 |
| 文档版本 | 1.0 |
| 被测版本 | PayOps v1.0（粗糙版） |
| 代码提交 | `6089ddc feat: add rough token purchase flow` |
| 测试类型 | 端到端浏览器验收 |
| 测试日期 | 2026-11-26 |
| 测试时间 | 05:45:14 - 05:45:25（UTC+8） |
| 测试结论 | 通过 |

## 2. 测试环境

| 项目 | 内容 |
|---|---|
| 操作系统 | Windows 11 10.0.26200 |
| 浏览器 | Google Chrome，headless |
| 视口 | 1440 × 1000 |
| 前端地址 | http://127.0.0.1:5173 |
| 后端地址 | http://localhost:8080 |
| 数据库 | MySQL 8.0.44，数据库 `payops` |
| 前端技术 | Vue 3 + Vite + Vue Router |
| 后端技术 | Java 17 + Spring Boot 3.3 + Spring Data JPA |
| 鉴权 | JWT + BCrypt |

## 3. 测试范围

本次验收覆盖管理员和普通用户在浏览器中的全部主要操作：

- 管理员：登录、查看后台数据、新增套餐、编辑套餐、停用套餐、重新上架、退出。
- 用户：注册、登录、勾选记住我、浏览套餐、购买套餐、查看订单、刷新保持登录、退出。
- 权限与异常：普通用户访问管理员页面、重复用户名注册、错误密码登录。
- 购买覆盖全部三个默认套餐：1 元、5 元、10 元。

不在本次范围：

- 真实支付渠道
- 并发扣款、超卖、分布式事务
- 多实例、负载均衡、高可用演练
- Docker、Nginx、Redis、MQ
- 密码找回、用户资料修改、删除套餐

## 4. 测试前置条件

- 后端和前端服务已启动。
- MySQL 数据库已创建，表结构由 JPA 自动生成。
- 启动数据已初始化：管理员 `admin`，三个默认套餐。
- 测试开始前清空普通用户、订单和临时测试套餐。
- 测试使用独立浏览器上下文，不共享已有登录状态。

## 5. 测试账号与数据

### 5.1 账号

| 角色 | 用户名 | 密码 | 初始状态 |
|---|---|---|---|
| 管理员 | `admin` | `admin123` | 现金 0.00，token 0.00 |
| 用户 A | `qa_user_a` | `secret123` | 注册赠送现金 10.00 |
| 用户 B | `qa_user_b` | `secret123` | 注册赠送现金 10.00 |

### 5.2 默认套餐

| 套餐 | 售价 | 到账 |
|---|---|---|
| 1 元 token | ¥0.95 | 1.00 token |
| 5 元 token | ¥4.50 | 5.00 token |
| 10 元 token | ¥8.50 | 10.00 token |

### 5.3 验收过程中创建的临时数据

| 数据 | 用途 | 最终状态 |
|---|---|---|
| 套餐 `20 元 token` | 管理员新增 | 已改为 `20 元 token（活动）` |
| 套餐 `20 元 token（活动）` | 管理员编辑、停用、上架 | 最终停用，不出现在用户商城 |

## 6. 结果汇总

| 角色 | 用例数 | 通过 | 失败 | 通过率 |
|---|---:|---:|---:|---:|
| 管理员 | 9 | 9 | 0 | 100% |
| 用户 | 18 | 18 | 0 | 100% |
| 合计 | 27 | 27 | 0 | 100% |

没有阻断缺陷。

## 7. 管理员操作记录

| 用例 | 操作 | 预期 | 实际 | 结果 | 截图 |
|---|---|---|---|---|---|
| ADM-01 | 打开登录页 | 显示登录/注册表单和管理员演示提示 | 登录页正常加载 | 通过 | [查看](screenshots/01-admin-login-page.png) |
| ADM-02 | 管理员登录 | 登录成功并进入管理后台 | 后台统计：1 / 3 / 0 | 通过 | [查看](screenshots/02-admin-dashboard.png) |
| ADM-03 | 查看用户和全部订单 | 展示用户列表、套餐列表和全部订单 | 用户 1 行，订单 0 行 | 通过 | [查看](screenshots/03-admin-users-orders.png) |
| ADM-04 | 新增套餐 | 新增 20 元 token，售价 17.00，到账 20.00 | 20 元 token / ¥17.00 / 20.00 token / 上架 | 通过 | [查看](screenshots/04-admin-create-product.png) |
| ADM-05 | 编辑套餐 | 名称改为 20 元 token（活动），售价改为 16.00 | 20 元 token（活动） / ¥16.00 / 20.00 token / 上架 | 通过 | [查看](screenshots/05-admin-edit-product.png) |
| ADM-06 | 停用套餐 | 临时套餐状态变为停用 | 套餐状态：停用 | 通过 | [查看](screenshots/06-admin-disable-product.png) |
| ADM-07 | 重新上架套餐 | 临时套餐状态恢复为上架 | 套餐状态：上架 | 通过 | [查看](screenshots/07-admin-enable-product.png) |
| ADM-08 | 清理测试套餐 | 临时套餐再次停用 | 测试套餐已停用 | 通过 | [查看](screenshots/08-admin-cleanup-product.png) |
| ADM-09 | 管理员退出 | 退出后回到登录页 | 当前页面：/login | 通过 | [查看](screenshots/09-admin-logout.png) |

## 8. 用户操作记录

| 用例 | 操作 | 预期 | 实际 | 结果 | 截图 |
|---|---|---|---|---|---|
| USR-01 | 打开注册表单 | 显示用户名、密码、确认密码 | 注册表单已显示 | 通过 | [查看](screenshots/10-user-register-form.png) |
| USR-02 | 注册用户 A | `qa_user_a` 注册成功，提示赠送 ¥10.00 | 注册成功，自动切回登录页 | 通过 | [查看](screenshots/11-user-register-success.png) |
| USR-03 | 勾选记住我 | 登录表单已填写并勾选 7 天免登录 | 账号已填写，记住我已勾选 | 通过 | [查看](screenshots/12-user-login-remember.png) |
| USR-04 | 用户 A 登录商城 | 余额 ¥10.00，token 0.00，显示三个套餐 | ¥10.00 / 0.00 / 0，套餐 3 个 | 通过 | [查看](screenshots/13-user-shop.png) |
| USR-05 | 购买 1 元 token | 扣款 ¥0.95，到账 1.00，生成一条订单 | ¥9.05 / 1.00 / 1，订单 1 条 | 通过 | [查看](screenshots/14-user-buy-1.png) |
| USR-06 | 购买 5 元 token | 扣款 ¥4.50，token 累计 6.00，生成第二条订单 | ¥4.55 / 6.00 / 2，订单 2 条 | 通过 | [查看](screenshots/15-user-buy-5.png) |
| USR-07 | 余额不足状态 | 10 元套餐按钮禁用，显示“余额不足” | 按钮状态：余额不足，disabled=true | 通过 | [查看](screenshots/16-user-insufficient-balance.png) |
| USR-08 | 查看我的订单 | 显示 1 元和 5 元两条已支付订单 | 订单共 2 条 | 通过 | [查看](screenshots/17-user-orders.png) |
| USR-09 | 刷新后保持登录 | 勾选记住我后刷新仍停留在商城 | 刷新后路径：/shop，余额 ¥4.55 / 6.00 / 2 | 通过 | [查看](screenshots/18-user-remember-me.png) |
| USR-10 | 用户访问管理员页面 | 前端路由拦截，重定向回商城 | 访问 /admin 后被重定向到 /shop | 通过 | [查看](screenshots/19-user-admin-forbidden.png) |
| USR-11 | 用户 A 退出 | 退出后回到登录页 | 当前页面：/login | 通过 | [查看](screenshots/20-user-a-logout.png) |
| USR-12 | 注册用户 B | `qa_user_b` 注册成功 | 注册成功 | 通过 | [查看](screenshots/21-user-b-register.png) |
| USR-13 | 用户 B 不勾选记住我登录 | 登录成功，记住我未勾选 | 登录成功，记住我=false | 通过 | [查看](screenshots/22-user-b-login.png) |
| USR-14 | 购买 10 元 token | 扣款 ¥8.50，到账 10.00，余额剩 ¥1.50 | ¥1.50 / 10.00 / 1，订单 1 条 | 通过 | [查看](screenshots/23-user-b-buy-10.png) |
| USR-15 | 会话存储刷新验证 | 未勾选记住我时，刷新当前标签页仍登录 | 刷新后路径：/shop，余额 ¥1.50 / 10.00 / 1 | 通过 | [查看](screenshots/24-user-b-session-reload.png) |
| USR-16 | 用户 B 退出 | 退出后回到登录页 | 当前页面：/login | 通过 | [查看](screenshots/25-user-b-logout.png) |
| USR-17 | 重复用户名注册 | 注册 `qa_user_a` 时提示“用户名已存在” | 页面提示：用户名已存在 | 通过 | [查看](screenshots/26-user-duplicate-register.png) |
| USR-18 | 错误密码登录 | 提示“用户名或密码错误” | 页面提示：用户名或密码错误 | 通过 | [查看](screenshots/27-user-wrong-password.png) |

## 9. 测试后数据状态

| 数据 | 状态 |
|---|---|
| 用户 | 3 人：`admin`、`qa_user_a`、`qa_user_b` |
| `qa_user_a` | 现金 ¥4.55，token 6.00，2 条订单 |
| `qa_user_b` | 现金 ¥1.50，token 10.00，1 条订单 |
| 套餐 | 4 个：三个默认套餐上架，`20 元 token（活动）` 停用 |
| 订单 | 3 条，状态均为已支付 |

测试数据保留在本地 MySQL，便于复查截图和页面状态。

## 10. 证据文件

- 结构化执行结果：[run-results.json](run-results.json)
- 截图目录：[screenshots](screenshots/)
- 自动化脚本：[acceptance.mjs](../../../e2e/acceptance.mjs)
- 流程脚本：[admin.mjs](../../../e2e/flows/admin.mjs)、[user.mjs](../../../e2e/flows/user.mjs)

截图均为 1440 × 1000 视口下的整页截图。

## 11. 已知边界

本版本是粗糙版，以下能力尚未实现：

- 不接真实支付渠道，购买就是余额扣款。
- 没有并发控制、幂等键或分布式事务。
- 没有库存，因此没有超卖逻辑。
- 没有多实例、负载均衡、故障转移。
- 没有 Redis、MQ、Docker、Nginx。
- 数据库使用 `ddl-auto=update`，暂未使用 Flyway。
- 管理员默认密码和开发 JWT 密钥仅用于本地演示，部署前必须通过环境变量覆盖。
- JWT 存储在前端 localStorage 或 sessionStorage，后续安全阶段需要重新评估。

## 12. 结论

PayOps v1.0 浏览器验收通过：27 个用例全部通过，0 失败，无阻断缺陷。

管理员和用户可以完成当前版本定义的全部主要操作，购买后余额、token 和订单数据一致，角色访问控制和登录持久化符合预期。

下一阶段可以在此基础上继续做并发、性能、高可用和故障演练。

## 13. 复现方式

```bash
# 1. 启动后端
cd backend
mvn spring-boot:run

# 2. 启动前端
cd frontend
npm install
npm run dev

# 3. 执行浏览器验收
cd e2e
npm install
npm run acceptance
```

脚本默认使用系统 Chrome；如不在默认路径，可设置 `CHROME_PATH`。
