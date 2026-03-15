require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/health', require('./routes/health'));
app.use('/api/user', require('./routes/user'));
app.use('/api/merit', require('./routes/merit'));
app.use('/api/rank', require('./routes/rank'));
app.use('/api/skin', require('./routes/skin'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🐟 敲木鱼服务已启动: http://localhost:${PORT}`));
