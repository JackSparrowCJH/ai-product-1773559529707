const { Router } = require('express');
const pool = require('../db/pool');
const router = Router();

// 同步功德：客户端上报增量
router.post('/sync', async (req, res) => {
  const { openid, delta } = req.body;
  if (!openid || !delta || delta < 1 || delta > 500) {
    return res.status(400).json({ error: 'invalid params (delta: 1-500)' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO merit_logs (openid, delta) VALUES ($1, $2)',
      [openid, delta]
    );
    const result = await client.query(
      `UPDATE users SET merit = merit + $1, updated_at = NOW()
       WHERE openid = $2 RETURNING merit`,
      [delta, openid]
    );
    await client.query('COMMIT');

    if (!result.rows.length) {
      return res.status(404).json({ error: 'user not found' });
    }
    res.json({ data: { merit: result.rows[0].merit } });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
