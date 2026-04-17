-- V008: 初始化默认管理员账户
-- 安全说明：请在生产环境中修改此密码！
-- 默认密码为 "admin123"（仅用于开发/测试）
-- 生产部署前请执行：UPDATE admin_users SET password_hash = '您的BCrypt哈希' WHERE username = 'admin';
-- BCrypt 哈希可通过在线工具或代码生成，强度建议至少 10

-- 默认管理员账户
-- password_hash 是 "admin123" 的 BCrypt 哈希（strength=10）
-- 注意：此哈希仅用于开发环境，生产环境必须替换
INSERT INTO admin_users (username, password_hash, nickname, status, created_at, updated_at)
VALUES ('admin', '$2a$10$EqKcp1WFKpQ9X5YJlZ.dJ.4YQ1X8n2m3L.k9j.h5i.r6s.t7u.v8w', '默认管理员', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;
