-- V009: 修正默认管理员密码哈希
-- 将 admin 账号密码重置为 admin123

UPDATE admin_users
SET password_hash = '$2b$10$XsUI5xHQsiZuEqPTVLUqH.T12AQv616AwvRwToRbOCTba92qf4me.',
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'admin';
