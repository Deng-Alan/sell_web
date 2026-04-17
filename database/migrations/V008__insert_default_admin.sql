-- V008: 初始化默认管理员账户
-- 注意：
-- 1. 该账户仅用于本地开发或首次部署后的引导
-- 2. 上线前应立即修改密码或删除该记录
-- 3. BCrypt 哈希对应的明文密码不得写入仓库文档

INSERT INTO admin_users (
    username,
    password_hash,
    nickname,
    status,
    created_at,
    updated_at
)
VALUES (
    'admin',
    '$2a$10$EqKcp1WFKpQ9X5YJlZ.dJ.4YQ1X8n2m3L.k9j.h5i.r6s.t7u.v8w',
    '默认管理员',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;
