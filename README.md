# sell_web

基础版商品展示网站，当前技术基线为：

- 前端：Next.js + React + TypeScript + Tailwind CSS
- 后端：Spring Boot + Spring Security + JWT
- 数据库：PostgreSQL

## 目录

- `frontend/` Next.js 前端工程
- `backend/` Spring Boot 后端工程
- `database/` PostgreSQL 迁移和初始化脚本
- `docs/` 规划和开发文档
- `openspec/` 规格与变更提案
- `.claude/` 任务和进度跟踪

## 常用命令

```bash
npm run dev:frontend
npm run build:frontend
mvn -f backend/pom.xml spring-boot:run
mvn -f backend/pom.xml -DskipTests package
```

## 部署与验收

- [宝塔 + Docker Compose 部署说明](docs/deploy/宝塔-Docker-Compose-部署.md)
- [基础版部署与验收清单](docs/planning/基础版-部署与验收清单.md)
