-- V010: expand contact types for current admin/front-end flows

ALTER TABLE contacts
    DROP CONSTRAINT IF EXISTS chk_contacts_type;

ALTER TABLE contacts
    ADD CONSTRAINT chk_contacts_type
        CHECK (type IN ('wechat', 'qq', 'phone', 'email', 'website', 'other', 'telegram', 'qr', 'link'));
