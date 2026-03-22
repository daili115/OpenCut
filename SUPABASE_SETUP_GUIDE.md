# Supabase 数据库设置指南

## 🎯 快速开始

由于环境变量加载问题，你可以直接在 Supabase 控制台中创建表，而不需要运行迁移命令。

## 📋 步骤

### 步骤 1: 登录 Supabase

1. 访问 [supabase.com](https://supabase.com)
2. 使用你的账户登录

### 步骤 2: 进入项目

1. 找到你的项目（OpenCut）
2. 点击进入项目

### 步骤 3: 打开 SQL Editor

1. 在左侧菜单中找到 "SQL Editor"
2. 点击打开

### 步骤 4: 创建表

在 SQL Editor 中运行以下 SQL 命令（按顺序）：

```sql
-- 1. 创建云端项目表
CREATE TABLE IF NOT EXISTS cloud_projects (
	id TEXT PRIMARY KEY,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	thumbnail TEXT,
	duration TEXT,
	version TEXT DEFAULT '1',
	settings JSONB,
	timeline_view_state JSONB,
	is_public BOOLEAN DEFAULT false NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. 创建云端场景表
CREATE TABLE IF NOT EXISTS cloud_scenes (
	id TEXT PRIMARY KEY,
	project_id TEXT NOT NULL REFERENCES cloud_projects(id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	is_main BOOLEAN DEFAULT false NOT NULL,
	tracks JSONB,
	bookmarks JSONB,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. 创建云端媒体资产表
CREATE TABLE IF NOT EXISTS cloud_media_assets (
	id TEXT PRIMARY KEY,
	project_id TEXT NOT NULL REFERENCES cloud_projects(id) ON DELETE CASCADE,
	user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	type TEXT NOT NULL,
	size TEXT NOT NULL,
	storage_url TEXT NOT NULL,
	thumbnail_url TEXT,
	width TEXT,
	height TEXT,
	duration TEXT,
	ephemeral BOOLEAN DEFAULT false NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. 创建索引
CREATE INDEX IF NOT EXISTS idx_cloud_projects_user_id ON cloud_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_projects_updated_at ON cloud_projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_scenes_project_id ON cloud_scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_cloud_media_assets_project_id ON cloud_media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_cloud_media_assets_user_id ON cloud_media_assets(user_id);
```

### 步骤 5: 验证表创建

1. 在左侧菜单中找到 "Table Editor"
2. 检查表是否创建成功：
   - `cloud_projects`
   - `cloud_scenes`
   - `cloud_media_assets`

### 步骤 6: 配置存储桶

1. 在左侧菜单中找到 "Storage"
2. 创建新存储桶，命名为 `media-assets`
3. 设置为 Public（如果需要公开访问）
4. 配置 CORS 策略（如果需要）

## 🔧 环境变量配置

### 方法 1: 使用 Supabase Dashboard

1. 进入项目的 "Settings" > "API"
2. 复制以下环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://mxucifuilzdmtwpcoenw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWNpZnVpbHpkbXR3cGNvZW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDM0NDUsImV4cCI6MjA4OTY3OTQ0NX0.tGdpQ73M6cWabe-MdFMRgB3EprE_nTP0VaiD_ulVlfQ
DATABASE_URL=postgresql://postgres:UwBVB1GXGOyJi2Gr@db.mxucifuilzdmtwpcoenw.supabase.co:5432/postgres
```

### 方法 2: 手动编辑 .env.local

打开 `apps/web/.env.local` 文件，确保包含：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://mxucifuilzdmtwpcoenw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWNpZnVpbHpkbXR3cGNvZW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDM0NDUsImV4cCI6MjA4OTY3OTQ0NX0.tGdpQ73M6cWabe-MdFMRgB3EprE_nTP0VaiD_ulVlfQ
DATABASE_URL=postgresql://postgres:UwBVB1GXGOyJi2Gr@db.mxucifuilzdmtwpcoenw.supabase.co:5432/postgres
```

## ✅ 验证清单

- [ ] Supabase 项目已创建
- [ ] 数据库表已创建（cloud_projects, cloud_scenes, cloud_media_assets）
- [ ] 存储桶已创建（media-assets）
- [ ] 环境变量已配置
- [ ] 应用可以连接到 Supabase

## 🚀 开始使用

完成上述步骤后，你的应用就可以：

1. ✅ 保存项目到云端
2. ✅ 从云端加载项目
3. ✅ 上传媒体文件
4. ✅ 跨设备访问项目
5. ✅ 实时同步（如果需要）

## 📝 注意事项

1. **用户认证**
   - 需要实现用户登录功能
   - 获取用户 ID 用于云端存储
   - 使用 better-auth 或 Supabase Auth

2. **文件大小限制**
   - Supabase 免费计划：1GB 存储
   - 单个文件：50MB
   - 如果需要更大的存储，考虑升级计划

3. **安全考虑**
   - 使用 RLS（Row Level Security）策略
   - 验证用户权限
   - 防止未授权访问

4. **性能优化**
   - 使用 CDN 加速文件访问
   - 实现懒加载
   - 缓存常用文件

## 🚨 故障排除

### 问题：无法连接到 Supabase

**解决方案**：
1. 检查网络连接
2. 验证 URL 和 key 是否正确
3. 检查 Supabase 项目状态
4. 查看浏览器控制台错误

### 问题：表创建失败

**解决方案**：
1. 检查 SQL 语法
2. 确保按顺序执行
3. 查看错误消息
4. 联系 Supabase 支持

## 📊 Supabase 免费计划

| 功能 | 免费 | Pro |
|------|--------|-----|
| 数据库 | 500MB | 8GB |
| 存储 | 1GB | 100GB |
| 带宽 | 2GB/月 | 50GB/月 |
| 实时连接 | 200 并发 | 2000 并发 |
| 文件大小 | 50MB | 5GB |

## 🎯 下一步

1. ✅ 在 Supabase 中创建表
2. ✅ 配置环境变量
3. ⏳ 测试云端存储功能
4. ⏳ 添加 UI 控件
5. ⏳ 实现自动同步
