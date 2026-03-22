# 云端存储实现指南

## 📋 架构概览

### 存储层次结构

```
┌─────────────────────────────────────────────────────────┐
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
        │  - PostgreSQL           │
        │  - Cloudflare R2       │
        └─────────────────────────┘
```

### 已创建的文件

1. **数据库 Schema** - `src/lib/db/cloud-schema.ts`
   - `cloud_projects` - 项目元数据
   - `cloud_scenes` - 场景数据
   - `cloud_media_assets` - 媒体文件引用

2. **云端存储服务** - `src/services/storage/cloud-storage.ts`
   - 项目 CRUD 操作
   - 媒体文件管理
   - 用户隔离

3. **文件上传服务** - `src/services/storage/cloud-upload.ts`
   - Cloudflare R2 上传
   - 文件删除
   - URL 生成

## 🚀 实现步骤

### 步骤 1: 运行数据库迁移

```bash
cd apps/web
bun run db:push:prod
```

### 步骤 2: 配置 Cloudflare R2

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 创建 R2 存储桶
3. 获取 API Token
4. 在 `.env.local` 中配置：

```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=opencut-media
```

### 步骤 3: 集成到 ProjectManager

在 `src/core/managers/project-manager.ts` 中添加云端存储方法：

```typescript
import { cloudStorageService } from "@/services/storage/cloud-storage";
import { cloudStorageUploadService } from "@/services/storage/cloud-upload";

export class ProjectManager {
	// ... 现有代码 ...

	async saveToCloud(): Promise<void> {
		const activeProject = this.getActive();
		if (!activeProject) {
			throw new Error("No active project");
		}

		const userId = this.getUserId(); // 从认证系统获取
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
		const uploadResult = await cloudStorageUploadService.uploadMediaAsset({
			file,
			projectId: activeProject.metadata.id,
			userId,
		});

		if (uploadResult.success && uploadResult.url) {
			await cloudStorageService.uploadMediaAsset({
				projectId: activeProject.metadata.id,
				userId,
				mediaAsset: {
					id: generateUUID(),
					name: file.name,
					type: this.getMediaType(file),
					file,
					url: uploadResult.url,
				},
				storageUrl: uploadResult.url,
			});
		}
	}

	private getUserId(): string {
		// 从认证系统获取当前用户 ID
		// 这需要集成 better-auth
		return "user-id-placeholder";
	}

	private getMediaType(file: File): "video" | "image" | "audio" {
		if (file.type.startsWith("video/")) return "video";
		if (file.type.startsWith("image/")) return "image";
		if (file.type.startsWith("audio/")) return "audio";
		return "video";
	}
}
```

### 步骤 4: 添加 UI 控件

在编辑器界面添加云端同步按钮：

```typescript
// src/components/editor/editor-header.tsx
import { Button } from "@/components/ui/button";
import { CloudIcon, DownloadIcon, UploadIcon } from "lucide-react";

export function EditorHeader() {
	const editor = useEditor();
	const [isSyncing, setIsSyncing] = useState(false);

	const handleSyncToCloud = async () => {
		setIsSyncing(true);
		try {
			await editor.project.saveToCloud();
			toast.success("Project synced to cloud");
		} catch (error) {
			toast.error("Failed to sync to cloud");
		} finally {
			setIsSyncing(false);
		}
	};

	const handleLoadFromCloud = async (projectId: string) => {
		setIsSyncing(true);
		try {
			await editor.project.loadFromCloud({ projectId });
			toast.success("Project loaded from cloud");
		} catch (error) {
			toast.error("Failed to load from cloud");
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
			>
				<UploadIcon className="w-4 h-4" />
				Sync to Cloud
			</Button>
			<Button
				onClick={() => handleLoadFromCloud("project-id")}
				disabled={isSyncing}
				variant="outline"
			>
				<DownloadIcon className="w-4 h-4" />
				Load from Cloud
			</Button>
		</div>
	);
}
```

## 📊 存储对比

| 特性 | 本地存储 | 云端存储 |
|------|---------|---------|
| **访问速度** | ⚡ 极快 | 🌐 依赖网络 |
| **跨设备** | ❌ 不支持 | ✅ 完全支持 |
| **数据持久化** | ⚠️ 清除浏览器丢失 | ✅ 永久保存 |
| **存储容量** | 💾 受浏览器限制 | 📦 可扩展 |
| **成本** | 💰 免费 | 💵 需要付费 |
| **隐私性** | 🔒 完全本地 | 🔐 需要信任服务商 |
| **离线使用** | ✅ 完全支持 | ⚠️ 需要网络 |

## 🎯 使用场景

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

**推荐**: 云端存储 + 分享功能
- 团队成员共享项目
- 版本控制
- 实时协作

## 🔧 高级功能

### 1. 自动同步

```typescript
class AutoSyncManager {
	private syncInterval: NodeJS.Timeout | null = null;

	startAutoSync({ intervalMs = 60000 }: { intervalMs?: number } = {}) {
		this.syncInterval = setInterval(async () => {
			const activeProject = editor.project.getActive();
			if (activeProject) {
				await editor.project.saveToCloud();
			}
		}, intervalMs);
	}

	stopAutoSync() {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
			this.syncInterval = null;
		}
	}
}
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

## 📝 最佳实践

### 1. 存储策略

- **小项目**: 优先本地存储
- **大项目**: 使用云端存储
- **临时项目**: 仅本地存储
- **重要项目**: 云端 + 本地备份

### 2. 性能优化

- 使用 CDN 加速文件访问
- 实现懒加载媒体文件
- 缓存常用文件到本地
- 压缩上传的文件

### 3. 安全考虑

- 加密敏感数据
- 实现访问控制
- 定期备份
- 监控异常访问

### 4. 成本控制

- 设置存储配额
- 定期清理无用文件
- 使用生命周期策略
- 监控存储使用量

## 🚨 故障处理

### 常见问题

1. **上传失败**
   - 检查网络连接
   - 验证 R2 配置
   - 检查文件大小限制

2. **同步冲突**
   - 实现冲突解决机制
   - 提供用户选择界面
   - 保留冲突历史记录

3. **存储空间不足**
   - 提示用户清理空间
   - 实现存储配额管理
   - 提供升级选项

## 📚 相关资源

- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Origin Private File System](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)

## 🎯 下一步

1. ✅ 数据库 schema 已创建
2. ✅ 云端存储服务已实现
3. ⏳ 集成到 ProjectManager
4. ⏳ 添加 UI 控件
5. ⏳ 实现自动同步
6. ⏳ 添加冲突解决
7. ⏳ 测试和优化
