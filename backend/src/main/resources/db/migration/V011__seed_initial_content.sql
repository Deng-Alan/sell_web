-- V011: seed initial showcase content for local/dev and first deployment

INSERT INTO product_categories (name, slug, sort_order, status)
VALUES
    ('邮箱账号', 'mail-accounts', 10, 1),
    ('社媒账号', 'social-accounts', 20, 1),
    ('工具软件', 'software-tools', 30, 1)
ON CONFLICT (slug) DO UPDATE
SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order,
    status = EXCLUDED.status;

INSERT INTO contacts (type, name, value, qr_image, jump_url, display_places, sort_order, status)
SELECT seed.type,
       seed.name,
       seed.value,
       seed.qr_image,
       seed.jump_url,
       seed.display_places,
       seed.sort_order,
       seed.status
FROM (
    VALUES
        ('wechat', '微信客服', 'sellweb_support', NULL, NULL, 'home,product,detail', 10, 1),
        ('qr', '二维码咨询', '扫码联系', 'https://dummyimage.com/600x600/111827/ffffff.png&text=SELL+WEB+QR', NULL, 'home,detail', 30, 1),
        ('email', '售后邮箱', 'support@example.com', NULL, 'mailto:support@example.com', 'detail,footer', 40, 1)
) AS seed(type, name, value, qr_image, jump_url, display_places, sort_order, status)
WHERE NOT EXISTS (
    SELECT 1
    FROM contacts existing
    WHERE existing.type = seed.type
      AND existing.name = seed.name
);

INSERT INTO site_settings (setting_key, setting_value, group_name)
VALUES
    ('site_name', 'Sell Web', 'home'),
    ('site_title', '商品展示网站', 'home'),
    ('site_subtitle', '可持续更新的商品展示与咨询入口', 'home'),
    ('home_hero_badge', '基础版站点已接入后台内容', 'home'),
    ('home_hero_kicker', 'Curated Digital Inventory', 'home'),
    ('home_hero_lead', '把商品展示做成一页能持续运营的目录。', 'home'),
    ('home_title', '让商品、联系入口和首页内容都可以后台直接维护', 'home'),
    ('home_hero_description', '当前版本已经具备分类、商品、联系方式、首页配置和 SEO 后台管理能力，适合先做展示与人工成交。', 'home'),
    ('home_primary_cta', '查看商品', 'home'),
    ('home_secondary_cta', '立即咨询', 'home'),
    ('home_hero_image', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80', 'home'),
    ('home_banner_image', 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1400&q=80', 'home'),
    ('home_announcement', '站点已完成后台联调，可直接录入分类、商品与联系方式。', 'home'),
    ('home_contact_hint', '点击任一咨询入口后，由人工继续承接成交。', 'home'),
    ('seo.home.titleTemplate', '{{siteName}} - 商品展示首页', 'seo'),
    ('seo.home.descriptionTemplate', '品牌首页、推荐商品与联系方式统一承接。', 'seo'),
    ('seo.home.keywords', '商品展示,首页,咨询入口', 'seo'),
    ('seo.home.robots', 'index,follow', 'seo'),
    ('seo.category.titleTemplate', '{{categoryName}} - {{siteName}}', 'seo'),
    ('seo.category.descriptionTemplate', '分类列表页，用于展示分类商品与筛选入口。', 'seo'),
    ('seo.category.keywords', '分类页,商品分类,筛选', 'seo'),
    ('seo.category.robots', 'index,follow', 'seo'),
    ('seo.product.titleTemplate', '{{productName}} - {{siteName}}', 'seo'),
    ('seo.product.descriptionTemplate', '商品详情页，展示说明、价格与咨询入口。', 'seo'),
    ('seo.product.keywords', '商品详情,咨询,价格', 'seo'),
    ('seo.product.robots', 'index,follow', 'seo'),
    ('seo.admin.titleTemplate', 'Admin - {{siteName}}', 'seo'),
    ('seo.admin.descriptionTemplate', '后台页面默认不参与收录。', 'seo'),
    ('seo.admin.keywords', 'admin,console', 'seo'),
    ('seo.admin.robots', 'noindex,nofollow', 'seo')
ON CONFLICT (setting_key) DO UPDATE
SET
    setting_value = EXCLUDED.setting_value,
    group_name = EXCLUDED.group_name;

INSERT INTO home_sections (section_key, title, content, image_url, extra_json, sort_order, status)
VALUES
    (
        'hero_banner',
        '首页 Hero',
        '首页首屏聚焦品牌定位、主按钮与次按钮，适合作为站点第一屏承接。',
        'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1400&q=80',
        '{"variant":"hero","cta":["查看商品","立即咨询"]}'::jsonb,
        10,
        1
    ),
    (
        'featured_products',
        '推荐商品',
        '这里可以放推荐位说明，也可以结合首页推荐商品做简短卖点。',
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80',
        '{"variant":"feature-grid","maxItems":6}'::jsonb,
        20,
        1
    ),
    (
        'workflow',
        '承接流程',
        '访客浏览商品后，通过联系方式进入人工咨询，再由商家继续成交。',
        NULL,
        '{"steps":["浏览商品","发起咨询","人工成交"]}'::jsonb,
        30,
        1
    ),
    (
        'contact_us',
        '联系入口',
        '首页和详情页都可以直接引导到微信、二维码或邮箱。',
        NULL,
        '{"variant":"contact-actions"}'::jsonb,
        40,
        1
    )
ON CONFLICT (section_key) DO UPDATE
SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    image_url = EXCLUDED.image_url,
    extra_json = EXCLUDED.extra_json,
    sort_order = EXCLUDED.sort_order,
    status = EXCLUDED.status;

INSERT INTO products (
    category_id,
    name,
    cover_image,
    short_desc,
    content,
    price,
    original_price,
    stock,
    contact_id,
    is_recommended,
    sort_order,
    status
)
SELECT
    category_ref.id,
    'Gmail 资源包',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
    '适合用于商品列表、详情页与后台联调的默认展示商品。',
    '这是一条默认种子商品，用于初始化前后台展示链路。后续你可以直接在后台编辑真实文案、价格和图集，而不需要再手动造数据。',
    18.00,
    30.00,
    126,
    contact_ref.id,
    1,
    10,
    1
FROM (SELECT id FROM product_categories WHERE slug = 'mail-accounts' LIMIT 1) AS category_ref,
     (SELECT id FROM contacts WHERE type = 'wechat' AND name = '微信客服' LIMIT 1) AS contact_ref
WHERE NOT EXISTS (
    SELECT 1
    FROM products
    WHERE name = 'Gmail 资源包'
);

INSERT INTO products (
    category_id,
    name,
    cover_image,
    short_desc,
    content,
    price,
    original_price,
    stock,
    contact_id,
    is_recommended,
    sort_order,
    status
)
SELECT
    category_ref.id,
    'Instagram 普通号',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80',
    '第二条默认商品，用于前台分类筛选和后台商品管理联调。',
    '你可以把这条数据理解成初始化展示样例。录入真实商品后，可以在后台删除或修改这条内容。',
    32.00,
    48.00,
    48,
    contact_ref.id,
    0,
    20,
    1
FROM (SELECT id FROM product_categories WHERE slug = 'social-accounts' LIMIT 1) AS category_ref,
     (SELECT id FROM contacts WHERE type = 'wechat' AND name = '微信客服' LIMIT 1) AS contact_ref
WHERE NOT EXISTS (
    SELECT 1
    FROM products
    WHERE name = 'Instagram 普通号'
);

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT
    product_ref.id,
    seed.image_url,
    seed.sort_order
FROM (SELECT id FROM products WHERE name = 'Gmail 资源包' LIMIT 1) AS product_ref,
     (
         VALUES
             ('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80', 0),
             ('https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80', 1)
     ) AS seed(image_url, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM product_images existing
    WHERE existing.product_id = product_ref.id
      AND existing.image_url = seed.image_url
);

INSERT INTO product_images (product_id, image_url, sort_order)
SELECT
    product_ref.id,
    seed.image_url,
    seed.sort_order
FROM (SELECT id FROM products WHERE name = 'Instagram 普通号' LIMIT 1) AS product_ref,
     (
         VALUES
             ('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80', 0)
     ) AS seed(image_url, sort_order)
WHERE NOT EXISTS (
    SELECT 1
    FROM product_images existing
    WHERE existing.product_id = product_ref.id
      AND existing.image_url = seed.image_url
);
