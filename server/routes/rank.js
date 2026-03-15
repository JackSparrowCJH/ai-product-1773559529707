const { Router } = require('express');
const pool = require('../db/pool');
const router = Router();

// 排行榜：Top N
router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  try {
    const result = await pool.query(
      `SELECT openid, nickname, avatar_url, merit
       FROM users ORDER BY merit DESC LIMIT $1`,
      [limit]
    );
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
