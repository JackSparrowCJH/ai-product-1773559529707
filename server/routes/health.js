const { Router } = require('express');
const pool = require('../db/pool');
const router = Router();

router.get('/', async (_req, res) => {
  try {
    const dbCheck = await pool.query('SELECT 1');
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('users','merit_logs','skins')
      ORDER BY table_name
    `);
    const indexes = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
      ORDER BY indexname
    `);
    res.json({
      status: 'ok',
      db: 'connected',
      tables: tables.rows.map(r => r.table_name),
      indexes: indexes.rows.map(r => r.indexname)
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

module.exports = router;
