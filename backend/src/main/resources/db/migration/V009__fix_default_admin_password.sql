-- V009: 修正默认管理员密码哈希
-- 将 sellwebadmin 账号密码重置为 sellwebadmin789

UPDATE admin_users
SET password_hash = '$2b$12$DRGks6653xs5hCK.HsSI4ex/RUyUBeQiQOQp6D2/YCFEtunS9RPYC',
    username = 'sellwebadmin',
    nickname = 'SellWeb 管理员',
    updated_at = CURRENT_TIMESTAMP
WHERE username IN ('admin', 'sellwebadmin');
