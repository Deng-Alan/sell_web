-- V003: 联系方式表
-- 客户联系方式信息，支持多种类型（微信、QQ、电话等）

CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    qr_image VARCHAR(255),
    jump_url VARCHAR(255),
    display_places VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 约束
    CONSTRAINT chk_contacts_type CHECK (type IN ('wechat', 'qq', 'phone', 'email', 'website', 'other')),
    CONSTRAINT chk_contacts_status CHECK (status IN (0, 1)),
    CONSTRAINT chk_contacts_sort_order CHECK (sort_order >= 0)
);

-- 索引
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_sort_order ON contacts(sort_order);

-- 注释
COMMENT ON TABLE contacts IS '联系方式表';
COMMENT ON COLUMN contacts.id IS '主键ID';
COMMENT ON COLUMN contacts.type IS '类型: wechat/qq/phone/email/website/other';
COMMENT ON COLUMN contacts.name IS '显示名称';
COMMENT ON COLUMN contacts.value IS '联系值(号码/链接等)';
COMMENT ON COLUMN contacts.qr_image IS '二维码图片URL(可选)';
COMMENT ON COLUMN contacts.jump_url IS '跳转链接(可选)';
COMMENT ON COLUMN contacts.display_places IS '展示位置(逗号分隔: home,product,detail)';
COMMENT ON COLUMN contacts.sort_order IS '排序序号(越小越靠前)';
COMMENT ON COLUMN contacts.status IS '状态: 0=隐藏, 1=显示';
COMMENT ON COLUMN contacts.created_at IS '创建时间';
COMMENT ON COLUMN contacts.updated_at IS '更新时间';

-- 触发器：自动更新 updated_at
CREATE TRIGGER trg_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();