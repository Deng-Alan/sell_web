# 宝塔 + Docker Compose 部署说明

## 1. 目标架构

- 域名：`emailcc.cn`
- 服务器：香港 Ubuntu
- 进程编排：`docker compose`
- 公网入口：容器内 `nginx` 负责 `80/443`
- 容器服务：
  - `nginx`：统一反向代理和 HTTPS 入口
  - `frontend`：Next.js
  - `backend`：Spring Boot
  - `postgres`：PostgreSQL

公网流量路径：

- `https://emailcc.cn/` -> `nginx` 容器 -> `frontend:3000`
- `https://emailcc.cn/api` -> `nginx` 容器 -> `backend:8080`

这样做的结果是入口完全容器化，前后端不再暴露宿主机端口，结构更统一。

## 2. 服务器准备

在服务器安装以下基础环境：

- Docker
- Docker Compose Plugin
- 宝塔面板

如果你启用容器内 `nginx`，宿主机上的宝塔网站 Nginx 不能继续占用 `80/443`。也就是说：

- 宝塔只保留面板管理功能
- 不要再给这个站点配置宝塔反向代理
- 如有必要，停止宝塔网站使用的 Nginx 服务，确保容器可以绑定 `80/443`

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
ENABLE_SSL=true
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

- `ENABLE_SSL=true` 时，容器会要求证书文件存在
- `NEXT_PUBLIC_API_BASE_URL` 给浏览器使用，必须是公网可访问地址
- `INTERNAL_API_BASE_URL` 给 Next.js 服务端渲染使用，必须是容器内地址
- `JPA_DDL_AUTO=validate`，避免生产环境自动改表
- `FLYWAY_ENABLED=true`，通过迁移脚本管理数据库结构

如果你后续要启用 `www.emailcc.cn`，需要把它一起加到 `APP_CORS_ALLOWED_ORIGINS`。

### 3.1 证书目录

如果使用 HTTPS，把证书文件放到：

```bash
deploy/nginx/certs/emailcc.cn/fullchain.pem
deploy/nginx/certs/emailcc.cn/privkey.pem
```

目录名必须和 `APP_DOMAIN` 一致。

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
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f nginx
```

## 5. 宝塔使用方式

这里不再使用宝塔站点反向代理。宝塔只负责：

- 面板管理
- 文件管理
- 防火墙和进程辅助管理

你需要做的是：

1. 确保域名 `emailcc.cn` 解析到服务器公网 IP
2. 确保服务器防火墙放行 `80/443`
3. 确保宝塔网站 Nginx 不再占用 `80/443`

## 6. 数据与持久化

Compose 已包含两个持久化卷：

- `postgres_data`：数据库数据
- `upload_data`：后台上传文件

此外还需要保留证书目录：

- `deploy/nginx/certs/`：Nginx HTTPS 证书

其中 `upload_data` 和证书目录都不能丢；否则会分别导致上传文件丢失或 HTTPS 启动失败。

## 7. 首次验收

### 7.1 容器检查

- `nginx` 为 `Up`
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

### 8.4 Nginx 容器启动失败

常见原因只有两类：

- 宿主机已有进程占用 `80/443`
- `ENABLE_SSL=true` 但证书文件不存在
