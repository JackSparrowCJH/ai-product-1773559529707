# 敲木鱼 🐟

微信小程序 + Node.js 后端服务

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，填入你的 Supabase 数据库连接串：

```
DB_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
```

### 3. 初始化数据库（创建表和索引）

```bash
npm run db:init
```

成功输出：
```
正在初始化数据库...
✅ 数据库表和索引创建成功
已创建的表: [ 'merit_logs', 'skins', 'users' ]
已创建的索引: [ 'idx_merit_logs_openid_time', 'idx_users_merit_desc', 'idx_users_openid' ]
```

### 4. 启动后端服务

```bash
npm start
```

### 5. 验证

```bash
# 健康检查
curl http://localhost:3000/api/health

# 用户登录
curl -X POST http://localhost:3000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"openid":"test_user_001","nickname":"测试用户"}'

# 同步功德
curl -X POST http://localhost:3000/api/merit/sync \
  -H "Content-Type: application/json" \
  -d '{"openid":"test_user_001","delta":10}'

# 查看排行榜
curl http://localhost:3000/api/rank

# 获取皮肤列表
curl http://localhost:3000/api/skin
```

### 6. 小程序端

用微信开发者工具打开 `miniprogram/` 目录即可预览。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查，返回数据库连接状态、表和索引 |
| POST | /api/user/login | 用户登录/注册 |
| GET | /api/user/:openid | 获取用户信息 |
| POST | /api/merit/sync | 同步功德增量 |
| GET | /api/rank?limit=20 | 功德排行榜 |
| GET | /api/skin | 皮肤列表 |
| POST | /api/skin/switch | 切换皮肤 |

## 数据库结构

- `users` - 用户表（openid, merit, skin 等）
- `merit_logs` - 敲击日志（防作弊校验）
- `skins` - 皮肤配置表
