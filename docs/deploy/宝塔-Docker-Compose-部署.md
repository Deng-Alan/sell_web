# 宝塔 + Docker Compose 部署说明

## 1. 目标架构

- 域名：`emailcc.cn`
- 服务器：香港 Ubuntu
- 进程编排：`docker compose`
- 公网入口：宝塔 Nginx 负责 `80/443` 和 HTTPS 证书
- 容器服务：
  - `frontend`：Next.js
  - `backend`：Spring Boot
  - `postgres`：PostgreSQL

公网流量路径：

- `https://emailcc.cn/` -> 宝塔反向代理 -> `http://127.0.0.1:3000`
- `https://emailcc.cn/api` -> 宝塔反向代理 -> `http://127.0.0.1:8080`

这样做更适合宝塔环境：证书、续期、域名和反向代理都在宝塔里管理，容器只负责业务服务。

## 2. 服务器准备

在服务器安装以下基础环境：

- Docker
- Docker Compose Plugin
- 宝塔面板

建议目录：

```bash
/www/wwwroot/emailcc.cn
```

把仓库放到该目录后，进入项目根目录。

## 3. 生产环境变量

复制示例文件：

```bash
cp .env.production.example .env.production
```

当前建议参数如下：

```env
APP_DOMAIN=emailcc.cn
APP_PATH=/root/sell_web
POSTGRES_DB=sell_web
POSTGRES_USER=sellweb
POSTGRES_PASSWORD=sw_pg_5mYh7Pq9Lx2Nf8Kc4Vt1Ra6Z
JWT_SECRET=sw_jwt_A7r2Kq9Lm4Nx8Vc1Tp6Yz3Hd5Bw0Ef7Ru2Sa9Jk6Px1Qm4Cn
JPA_DDL_AUTO=validate
FLYWAY_ENABLED=true
APP_CORS_ALLOWED_ORIGINS=https://emailcc.cn
NEXT_PUBLIC_API_BASE_URL=https://emailcc.cn/api
INTERNAL_API_BASE_URL=http://backend:8080/api
```

说明：

- `APP_PATH` 必须是服务器上的项目绝对路径；如果你用宝塔编排页面，这是关键项
- `NEXT_PUBLIC_API_BASE_URL` 给浏览器使用，必须是公网可访问地址
- `INTERNAL_API_BASE_URL` 给 Next.js 服务端渲染使用，必须是容器内地址
- `JPA_DDL_AUTO=validate`，避免生产环境自动改表
- `FLYWAY_ENABLED=true`，通过迁移脚本管理数据库结构

如果你后续要启用 `www.emailcc.cn`，需要把它一起加到 `APP_CORS_ALLOWED_ORIGINS`。

## 4. 启动命令

首次启动：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

后续更新：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

查看状态：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

查看日志：

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f postgres
```

## 5. 宝塔站点配置

如果你坚持使用宝塔 Docker 的“容器编排”页面，不要直接依赖 `./frontend` / `./backend` 这种相对路径。当前仓库已经改成读取 `APP_PATH`，所以在宝塔编排页面的 `.env` 内容里必须填写真实绝对路径，例如：

```env
APP_PATH=/root/sell_web
```

如果你的仓库不在 `/root/sell_web`，这里必须改成实际路径。

先在宝塔创建站点：

- 域名：`emailcc.cn`
- PHP 版本：纯静态即可，不依赖 PHP

然后在宝塔里给站点申请并启用 HTTPS 证书。

### 5.1 反向代理 `/`

- 目标地址：`http://127.0.0.1:3000`

### 5.2 反向代理 `/api`

- 目标地址：`http://127.0.0.1:8080`

要点：

- `/api` 必须单独转发到后端
- `/` 保持转发到前端
- 不要把 PostgreSQL 端口暴露到公网

## 6. 数据与持久化

Compose 已包含两个持久化卷：

- `postgres_data`：数据库数据
- `upload_data`：后台上传文件

这两个卷都必须保留；尤其是 `upload_data`，否则后台上传的商品图片和站点图片会在重建容器后丢失。

## 7. 首次验收

### 7.1 容器检查

- `frontend` 为 `Up`
- `backend` 为 `Up`
- `postgres` 为 `Up (healthy)`

### 7.2 接口检查

访问：

- `https://emailcc.cn/api/health`

预期：

```json
{"success":true,"message":"ok"}
```

### 7.3 前台检查

前台应只保留这些能力：

- 商品首页
- 商品详情页
- 联系方式页

不应存在可用的前台注册/登录流程。

### 7.4 后台检查

后台固定账号：

- 用户名：`sellwebadmin`
- 密码：`sellwebadmin789`

检查项：

- 可以成功登录后台
- 商品、分类、联系方式、首页区块、站点设置可以读取和保存
- 上传图片后能正常访问图片 URL

## 8. 常见问题

### 8.1 页面能打开但接口 403 或跨域失败

先检查：

- `.env.production` 里的 `APP_CORS_ALLOWED_ORIGINS`
- 宝塔实际访问域名是否与配置完全一致
- 是否同时混用了 `http` 和 `https`

### 8.2 前端能开，SSR 页面报后端连接失败

这通常是 `INTERNAL_API_BASE_URL` 配错了。容器内部应使用：

```env
INTERNAL_API_BASE_URL=http://backend:8080/api
```

### 8.3 发布后图片丢失

说明上传目录没有持久化。确认 `docker-compose.prod.yml` 中的 `upload_data` 仍然挂载到 `/app/uploads`。
