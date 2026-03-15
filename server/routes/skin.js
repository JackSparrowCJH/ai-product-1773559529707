const { Router } = require('express');
const pool = require('../db/pool');
const router = Router();

// 获取皮肤列表
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM skins ORDER BY sort_order');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 切换皮肤
router.post('/switch', async (req, res) => {
  const { openid, skin_id } = req.body;
  if (!openid || !skin_id) return res.status(400).json({ error: 'missing params' });

  try {
    const skin = await pool.query('SELECT id FROM skins WHERE id = $1', [skin_id]);
    if (!skin.rows.length) return res.status(404).json({ error: 'skin not found' });

    await pool.query(
      'UPDATE users SET current_skin = $1, updated_at = NOW() WHERE openid = $2',
      [skin_id, openid]
    );
    res.json({ data: { current_skin: skin_id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
