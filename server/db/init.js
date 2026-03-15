const pool = require('./pool');

const SQL = `
-- 用户表：存储用户信息与功德数
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  openid        VARCHAR(128) NOT NULL UNIQUE,
  nickname      VARCHAR(128) DEFAULT '',
  avatar_url    TEXT DEFAULT '',
  merit         BIGINT DEFAULT 0,
  current_skin  VARCHAR(64) DEFAULT 'default',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 敲击记录表：用于数据校验与防作弊
CREATE TABLE IF NOT EXISTS merit_logs (
  id            SERIAL PRIMARY KEY,
  openid        VARCHAR(128) NOT NULL,
  delta         INT NOT NULL,
  source        VARCHAR(32) DEFAULT 'tap',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 皮肤配置表
CREATE TABLE IF NOT EXISTS skins (
  id            VARCHAR(64) PRIMARY KEY,
  name          VARCHAR(64) NOT NULL,
  image_url     TEXT DEFAULT '',
  sound_url     TEXT DEFAULT '',
  sort_order    INT DEFAULT 0
);

-- 索引：按 openid 查询用户（登录/同步）
CREATE INDEX IF NOT EXISTS idx_users_openid ON users (openid);

-- 索引：按功德数降序排列（排行榜）
CREATE INDEX IF NOT EXISTS idx_users_merit_desc ON users (merit DESC);

-- 索引：按 openid + 时间查询敲击日志（防作弊校验）
CREATE INDEX IF NOT EXISTS idx_merit_logs_openid_time ON merit_logs (openid, created_at DESC);

-- 插入默认皮肤数据（幂等）
INSERT INTO skins (id, name, sort_order) VALUES
  ('default',    '经典木鱼',    0),
  ('cyberpunk',  '赛博朋克',    1),
  ('jade',       '翡翠禅心',    2),
  ('gold',       '黄金圣鱼',    3)
ON CONFLICT (id) DO NOTHING;
`;

async function init() {
  console.log('正在初始化数据库...');
  try {
    await pool.query(SQL);
    console.log('✅ 数据库表和索引创建成功');

    // 验证
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('users','merit_logs','skins')
      ORDER BY table_name
    `);
    console.log('已创建的表:', tables.rows.map(r => r.table_name));

    const indexes = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `);
    console.log('已创建的索引:', indexes.rows.map(r => r.indexname));
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();
