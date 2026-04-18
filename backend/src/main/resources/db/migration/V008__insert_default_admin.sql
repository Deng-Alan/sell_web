-- V008: 初始化默认管理员账户
-- 安全说明：请在生产环境中修改此密码！
-- 默认密码为 "sellwebadmin789"（仅用于开发/测试）
-- 生产部署前请执行：UPDATE admin_users SET password_hash = '您的BCrypt哈希' WHERE username = 'sellwebadmin';
-- BCrypt 哈希可通过在线工具或代码生成，强度建议至少 10

-- 默认管理员账户
-- password_hash 是 "sellwebadmin789" 的 BCrypt 哈希（strength=12）
-- 注意：此哈希仅用于开发环境，生产环境必须替换
INSERT INTO admin_users (username, password_hash, nickname, status, created_at, updated_at)
VALUES ('sellwebadmin', '$2b$12$DRGks6653xs5hCK.HsSI4ex/RUyUBeQiQOQp6D2/YCFEtunS9RPYC', 'SellWeb 管理员', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;
