const { Router } = require('express');
const pool = require('../db/pool');
const router = Router();

// 登录/注册：通过 openid 获取或创建用户
router.post('/login', async (req, res) => {
  const { openid, nickname, avatar_url } = req.body;
  if (!openid) return res.status(400).json({ error: 'openid is required' });

  try {
    const result = await pool.query(
      `INSERT INTO users (openid, nickname, avatar_url)
       VALUES ($1, $2, $3)
       ON CONFLICT (openid) DO UPDATE SET
         nickname = COALESCE(NULLIF($2,''), users.nickname),
         avatar_url = COALESCE(NULLIF($3,''), users.avatar_url),
         updated_at = NOW()
       RETURNING id, openid, nickname, avatar_url, merit, current_skin`,
      [openid, nickname || '', avatar_url || '']
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取用户信息
router.get('/:openid', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, openid, nickname, merit, current_skin FROM users WHERE openid = $1',
      [req.params.openid]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'user not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
