# database

PostgreSQL 数据库初始化与迁移目录。

## 目录结构

```
database/
├── migrations/          # SQL 迁移脚本源文件
│   ├── V001__create_admin_users.sql
│   ├── V002__create_product_categories.sql
│   ├── V003__create_contacts.sql
│   ├── V004__create_products.sql
│   ├── V005__create_product_images.sql
│   ├── V006__create_site_settings.sql
│   └── V007__create_home_sections.sql
├── seeds/               # 初始数据脚本(可选)
│   └── README.md
└── README.md            # 本文件
```

## 同步策略

迁移脚本同时在两个位置维护：
1. `database/migrations/` - 主源目录，便于文档和手动执行
2. `backend/src/main/resources/db/migration/` - Flyway 自动执行目录

**同步方式：** 修改迁移脚本时，需同时更新两个目录，或在 backend 启动前从 database/migrations 复制。

## 表结构概览

| 表名 | 说明 |
|---|---|
| admin_users | 管理员用户表 |
| product_categories | 商品分类表 |
| contacts | 联系方式表 |
| products | 商品表 |
| product_images | 商品图片表 |
| site_settings | 站点配置表 |
| home_sections | 首页区块表 |

## 迁移执行

### 使用 Flyway (推荐)

Spring Boot 配置了 Flyway 自动迁移：
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
```

启动 backend 应用时会自动执行迁移。

### 手动执行

```bash
# 连接 PostgreSQL
psql -U postgres -d sell_web

# 执行迁移脚本
\i database/migrations/V001__create_admin_users.sql
\i database/migrations/V002__create_product_categories.sql
# ... 依次执行
```

## 主要特性

- 所有表都有主键 `id BIGSERIAL`
- 状态字段使用 `SMALLINT` 并配置 CHECK 约束
- 时间字段使用 `TIMESTAMP` 并自动维护 `updated_at`
- 外键关系明确，删除策略合理配置
- 索引覆盖常用查询字段
- 全文搜索支持商品名称搜索

---

更新日期：2026-04-15