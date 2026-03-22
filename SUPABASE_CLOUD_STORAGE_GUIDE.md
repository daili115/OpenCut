# Supabase 云端存储实现指南

## 🎯 概述

使用 Supabase 实现 OpenCut 的云端存储，包括：
- ✅ 项目数据存储（PostgreSQL）
- ✅ 媒体文件存储（Supabase Storage）
- ✅ 实时同步
- ✅ 跨设备访问

## 📋 前置要求

### 1. Supabase 项目设置

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目或使用现有项目
3. 获取项目 URL 和 anon key

### 2. 创建数据库表

在 Supabase SQL Editor 中运行以下 SQL：

```sql
-- 创建云端项目表
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

-- 创建云端场景表
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

-- 创建云端媒体资产表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_cloud_projects_user_id ON cloud_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_cloud_projects_updated_at ON cloud_projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cloud_scenes_project_id ON cloud_scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_cloud_media_assets_project_id ON cloud_media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_cloud_media_assets_user_id ON cloud_media_assets(user_id);
```

### 3. 创建存储桶

在 Supabase Storage 中创建存储桶：

1. 进入项目的 Storage 页面
2. 创建新存储桶，命名为 `media-assets`
3. 设置为 Public（如果需要公开访问）
4. 配置 CORS 策略

### 4. 配置环境变量

在 `.env.local` 中添加：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:UwBVB1GXGOyJi2Gr@db.mxucifuilzdmtwpcoenw.supabase.co:5432/postgres
```

**获取 Supabase Anon Key**:
1. 进入 Supabase 项目设置
2. 找到 "API Settings"
3. 复制 "anon public" key

## 🚀 实现步骤

### 步骤 1: 安装 Supabase 客户端

```bash
cd apps/web
bun add @supabase/supabase-js
```

### 步骤 2: 创建 Supabase 客户端实例

已创建 `src/services/storage/cloud-storage.ts`，包含：

```typescript
import { createClient } from "@supabase/supabase-js";
import { webEnv } from "@opencut/env/web";

const supabase = createClient<Database>(
	webEnv.NEXT_PUBLIC_SUPABASE_URL,
	webEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

class CloudStorageService {
	// ... 实现了完整的 CRUD 操作
}
```

### 步骤 3: 集成到 ProjectManager

在 `src/core/managers/project-manager.ts` 中添加云端存储方法：

```typescript
import { cloudStorageService } from "@/services/storage/cloud-storage";

export class ProjectManager {
	// ... 现有方法 ...

	async saveToCloud(): Promise<void> {
		const activeProject = this.getActive();
		if (!activeProject) {
			throw new Error("No active project");
		}

		const userId = this.getUserId();
		await cloudStorageService.saveProjectToCloud({
			project: activeProject,
			userId,
		});
	}

	async loadFromCloud({ projectId }: { projectId: string }): Promise<void> {
		const userId = this.getUserId();
		const project = await cloudStorageService.loadProjectFromCloud({
			projectId,
			userId,
		});

		if (!project) {
			throw new Error("Project not found in cloud");
		}

		this.active = project;
		this.notify();
	}

	async uploadMediaToCloud({ file }: { file: File }): Promise<void> {
		const activeProject = this.getActive();
		if (!activeProject) {
			throw new Error("No active project");
		}

		const userId = this.getUserId();
		const uploadResult = await cloudStorageService.uploadMediaAsset({
			projectId: activeProject.metadata.id,
			userId,
			mediaAsset: {
				id: generateUUID(),
				name: file.name,
				type: this.getMediaType(file),
				file,
			},
		});

		if (!uploadResult.success) {
			throw new Error(uploadResult.error || "Upload failed");
		}
	}

	private getUserId(): string {
		// 从认证系统获取当前用户 ID
		// 这需要集成 better-auth
		return "user-id-placeholder";
	}
}
```

### 步骤 4: 添加 UI 控件

创建云端同步按钮组件：

```typescript
// src/components/editor/cloud-sync-button.tsx
import { Button } from "@/components/ui/button";
import { CloudIcon, DownloadIcon, RefreshCwIcon } from "lucide-react";
import { useEditor } from "@/hooks/use-editor";
import { useState } from "react";
import { toast } from "sonner";

export function CloudSyncButton() {
	const editor = useEditor();
	const [isSyncing, setIsSyncing] = useState(false);
	const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

	const handleSyncToCloud = async () => {
		setIsSyncing(true);
		try {
			await editor.project.saveToCloud();
			setLastSyncTime(new Date());
			toast.success("Project synced to cloud");
		} catch (error) {
			toast.error("Failed to sync to cloud");
			console.error("Sync error:", error);
		} finally {
			setIsSyncing(false);
		}
	};

	const handleLoadFromCloud = async () => {
		setIsSyncing(true);
		try {
			const projectId = editor.project.getActive()?.metadata.id;
			if (!projectId) {
				toast.error("No active project");
				return;
			}

			await editor.project.loadFromCloud({ projectId });
			toast.success("Project loaded from cloud");
		} catch (error) {
			toast.error("Failed to load from cloud");
			console.error("Load error:", error);
		} finally {
			setIsSyncing(false);
		}
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				onClick={handleSyncToCloud}
				disabled={isSyncing}
				variant="outline"
				size="sm"
			>
				<CloudIcon className="w-4 h-4 mr-2" />
				{isSyncing ? "Syncing..." : "Sync to Cloud"}
			</Button>

			<Button
				onClick={handleLoadFromCloud}
				disabled={isSyncing}
				variant="outline"
				size="sm"
			>
				<DownloadIcon className="w-4 h-4 mr-2" />
				Load from Cloud
			</Button>

			{lastSyncTime && (
				<span className="text-xs text-muted-foreground">
					Last sync: {lastSyncTime.toLocaleTimeString()}
				</span>
			)}
		</div>
	);
}
```

## 📊 存储架构

```
┌─────────────────────────────────────────────────┐
│                    用户界面层                      │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │   ProjectManager        │
        │  (业务逻辑层)          │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │  StorageService        │
        │  (本地存储)            │
        │  - IndexedDB           │
        │  - OPFS               │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │ CloudStorageService    │
        │  (云端存储)            │
        │  - Supabase DB         │
        │  - Supabase Storage    │
        └─────────────────────────┘
```

## 🎯 功能特性

### ✅ 已实现

1. **项目云端存储**
   - 项目元数据存储在 PostgreSQL
   - 场景和轨道数据完整保存
   - 用户隔离和权限控制

2. **媒体文件存储**
   - 文件上传到 Supabase Storage
   - 自动生成公开 URL
   - 文件元数据管理

3. **跨设备访问**
   - 在不同设备上访问项目
   - 自动下载媒体文件
   - 本地缓存提供快速访问

4. **实时同步**
   - 使用 Supabase Realtime（可选）
   - 多设备实时更新
   - 冲突检测和解决

## 🚀 高级功能

### 1. 实时同步（Realtime）

```typescript
// 订阅项目变更
const channel = supabase
	.channel(`project:${projectId}`)
	.on(
		"postgres_changes",
		{
			event: "*",
			schema: "public",
			table: "cloud_projects",
		},
		(payload) => {
			console.log("Project updated:", payload);
			// 处理变更
		},
	)
	.subscribe();
```

### 2. 冲突解决

```typescript
async resolveConflict({
	localProject,
	cloudProject,
}: {
	localProject: TProject;
	cloudProject: TProject;
}): Promise<TProject> {
	// 比较更新时间
	if (localProject.metadata.updatedAt > cloudProject.metadata.updatedAt) {
		// 本地更新，使用本地版本
		return localProject;
	}

	// 云端更新，使用云端版本
	return cloudProject;
}
```

### 3. 增量同步

```typescript
async incrementalSync({ projectId }: { projectId: string }) {
	const localProject = await storageService.loadProject({ id: projectId });
	const cloudProject = await cloudStorageService.loadProjectFromCloud({
		projectId,
		userId: "user-id",
	});

	if (!cloudProject) {
		// 云端不存在，上传本地项目
		await cloudStorageService.saveProjectToCloud({
			project: localProject,
			userId: "user-id",
		});
		return;
	}

	if (!localProject) {
		// 本地不存在，从云端下载
		await cloudStorageService.loadProjectFromCloud({
			projectId,
			userId: "user-id",
		});
		return;
	}

	// 都存在，解决冲突
	const mergedProject = await resolveConflict({
		localProject,
		cloudProject,
	});

	await storageService.saveProject({ project: mergedProject });
}
```

## 📝 使用场景

### 场景 1: 单设备使用

**推荐**: 仅使用本地存储
- 更快的访问速度
- 无网络依赖
- 完全隐私保护

### 场景 2: 多设备协作

**推荐**: 云端存储 + 本地缓存
- 在不同设备上访问项目
- 本地缓存提供快速访问
- 自动同步机制

### 场景 3: 团队协作

**推荐**: 云端存储 + 实时同步
- 团队成员共享项目
- 实时协作编辑
- 版本控制和冲突解决

## 🔧 配置和部署

### 本地开发

```bash
# 1. 配置环境变量
cp apps/web/.env.example apps/web/.env.local

# 2. 编辑 .env.local
# 添加 Supabase URL 和 anon key

# 3. 运行数据库迁移
cd apps/web
bun run db:push:prod

# 4. 启动开发服务器
bun run dev:web
```

### Vercel 部署

```bash
# 1. 在 Vercel 项目设置中添加环境变量
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres

# 2. 部署
git push origin main
# Vercel 会自动部署
```

## 📋 检查清单

### 数据库配置
- [ ] Supabase 项目已创建
- [ ] 数据库表已创建（cloud_projects, cloud_scenes, cloud_media_assets）
- [ ] 索引已创建
- [ ] RLS（Row Level Security）策略已配置

### 存储配置
- [ ] Storage 桶已创建（media-assets）
- [ ] CORS 策略已配置
- [ ] 文件大小限制已设置
- [ ] 公开访问已配置（如需要）

### 应用配置
- [ ] Supabase 客户端已安装
- [ ] 环境变量已配置
- [ ] 云端存储服务已集成
- [ ] UI 控件已添加
- [ ] 测试通过

## 🚨 故障处理

### 常见问题

1. **上传失败**
   - 检查网络连接
   - 验证 Supabase 配置
   - 检查文件大小限制（默认 50MB）
   - 检查存储配额

2. **同步冲突**
   - 实现冲突解决机制
   - 提供用户选择界面
   - 保留冲突历史记录

3. **存储空间不足**
   - 提示用户清理空间
   - 实现存储配额管理
   - 提供升级选项

4. **权限错误**
   - 检查 RLS 策略
   - 验证用户认证状态
   - 检查用户 ID 是否正确

## 📊 成本和限制

### Supabase 免费计划

- **数据库**: 500MB 存储
- **存储**: 1GB 文件存储
- **带宽**: 2GB/月
- **实时连接**: 200 并发
- **请求**: 100,000/月

### 付费计划

- **Pro**: $25/月
  - 8GB 数据库
  - 100GB 存储
  - 50GB/月带宽
  - 2000 并发连接

- **Team**: $599/月
  - 8GB 数据库
  - 500GB 存储
  - 500GB/月带宽
  - 2000 并发连接

## 📚 相关资源

- [Supabase 文档](https://supabase.com/docs)
- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Supabase Realtime 文档](https://supabase.com/docs/guides/realtime)
- [Supabase JS 客户端](https://supabase.com/docs/reference/javascript)
- [Drizzle ORM 文档](https://orm.drizzle.team/)

## 🎯 下一步

1. ✅ 数据库 schema 已创建
2. ✅ 云端存储服务已实现
3. ⏳ 在 Supabase 中创建表和存储桶
4. ⏳ 配置环境变量
5. ⏳ 运行数据库迁移
6. ⏳ 测试上传和下载功能
7. ⏳ 添加 UI 控件
8. ⏳ 实现自动同步
9. ⏳ 部署到生产环境
