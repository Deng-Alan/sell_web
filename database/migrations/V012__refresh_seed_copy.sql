UPDATE products
SET
    short_desc = '适合用于商品展示、详情页浏览与后台联调的默认商品。',
    content = '展示 Gmail 商品的标题、价格、库存、联系方式与详情说明，适合前台真实联调和后台演示。'
WHERE name = 'Gmail 资源包';

UPDATE products
SET
    short_desc = '用于前台分类筛选、商品详情展示与后台商品管理联调。',
    content = '展示 Instagram 商品的基础信息、价格库存和咨询入口，适合验证商品管理到前台展示的完整链路。'
WHERE name = 'Instagram 普通号';
