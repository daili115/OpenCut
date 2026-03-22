import { createClient } from "@supabase/supabase-js";
import type { TProject, TProjectMetadata } from "@/types/project";
import type { MediaAsset } from "@/types/assets";
import type { SavedSoundsData, SavedSound, SoundEffect } from "@/types/sounds";
import type { Bookmark, TimelineTrack, TScene } from "@/types/timeline";
import { storageService } from "./service";
import { webEnv } from "@opencut/env/web";

const supabase = createClient<Database>(
	webEnv.NEXT_PUBLIC_SITE_URL,
	webEnv.SUPABASE_ANON_KEY,
);

export interface CloudStorageConfig {
	enabled: boolean;
	userId: string | null;
}

class CloudStorageService {
	private config: CloudStorageConfig = {
		enabled: false,
		userId: null,
	};

	private listeners = new Set<() => void>();

	constructor() {}

	setConfig({ enabled, userId }: Partial<CloudStorageConfig>): void {
		this.config = {
			enabled: enabled ?? this.config.enabled,
			userId: userId ?? this.config.userId,
		};
		this.notify();
	}

	getConfig(): CloudStorageConfig {
		return this.config;
	}

	isEnabled(): boolean {
		return this.config.enabled && this.config.userId !== null;
	}

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notify(): void {
		this.listeners.forEach((listener) => listener());
	}

	async saveProjectToCloud({ project, userId }: { project: TProject; userId: string }): Promise<void> {
		if (!this.isEnabled()) {
			throw new Error("Cloud storage is not enabled");
		}

		const duration = project.metadata.duration;
		const serializedScenes = project.scenes.map((scene) => ({
			id: scene.id,
			name: scene.name,
			isMain: scene.isMain,
			tracks: scene.tracks,
			bookmarks: scene.bookmarks,
			createdAt: scene.createdAt.toISOString(),
			updatedAt: scene.updatedAt.toISOString(),
		}));

		const projectData = {
			id: project.metadata.id,
			userId,
			name: project.metadata.name,
			thumbnail: project.metadata.thumbnail,
			duration: duration?.toString(),
			version: project.version,
			settings: project.settings,
			timelineViewState: project.timelineViewState,
			isPublic: false,
			createdAt: project.metadata.createdAt.toISOString(),
			updatedAt: project.metadata.updatedAt.toISOString(),
			scenes: serializedScenes,
			currentSceneId: project.currentSceneId,
		};

		const { data, error } = await supabase
			.from("cloud_projects")
			.upsert(projectData)
			.select()
			.single();

		if (error) {
			throw new Error(`Failed to save project to cloud: ${error.message}`);
		}

		await storageService.saveProject({ project });
	}

	async loadProjectFromCloud({ projectId, userId }: { projectId: string; userId: string }): Promise<TProject | null> {
		const { data: projectData, error: projectError } = await supabase
			.from("cloud_projects")
			.select()
			.eq("id", projectId)
			.eq("user_id", userId)
			.single();

		if (projectError || !projectData) {
			return null;
		}

		const { data: scenesData, error: scenesError } = await supabase
			.from("cloud_scenes")
			.select()
			.eq("project_id", projectId);

		if (scenesError) {
			throw new Error(`Failed to load scenes: ${scenesError.message}`);
		}

		const scenes: TScene[] = (scenesData || []).map((sceneRow) => ({
			id: sceneRow.id,
			name: sceneRow.name,
			isMain: sceneRow.isMain,
			tracks: sceneRow.tracks as TimelineTrack[],
			bookmarks: sceneRow.bookmarks as Bookmark[],
			createdAt: new Date(sceneRow.created_at),
			updatedAt: new Date(sceneRow.updated_at),
		}));

		const project: TProject = {
			metadata: {
				id: projectData.id,
				name: projectData.name,
				thumbnail: projectData.thumbnail,
				duration: projectData.duration ? parseFloat(projectData.duration) : undefined,
				createdAt: new Date(projectData.created_at),
				updatedAt: new Date(projectData.updated_at),
			},
			scenes,
			currentSceneId: projectData.currentSceneId || scenes[0]?.id || "",
			settings: projectData.settings as TProject["settings"],
			version: projectData.version,
			timelineViewState: projectData.timelineViewState as TProject["timelineViewState"],
		};

		await storageService.saveProject({ project });
		return project;
	}

	async loadAllCloudProjects({ userId }: { userId: string }): Promise<TProjectMetadata[]> {
		const { data: projects, error } = await supabase
			.from("cloud_projects")
			.select()
			.eq("user_id", userId)
			.order("updated_at", { ascending: false });

		if (error) {
			throw new Error(`Failed to load projects: ${error.message}`);
		}

		return (projects || []).map((project) => ({
			id: project.id,
			name: project.name,
			thumbnail: project.thumbnail,
			duration: project.duration ? parseFloat(project.duration) : undefined,
			createdAt: new Date(project.created_at),
			updatedAt: new Date(project.updated_at),
		}));
	}

	async deleteCloudProject({ projectId, userId }: { projectId: string; userId: string }): Promise<void> {
		const { error: projectError } = await supabase
			.from("cloud_projects")
			.delete()
			.eq("id", projectId)
			.eq("user_id", userId);

		if (projectError) {
			throw new Error(`Failed to delete project: ${projectError.message}`);
		}

		await storageService.deleteProject({ id: projectId });
	}

	async uploadMediaAsset({
		projectId,
		userId,
		mediaAsset,
	}: {
		projectId: string;
		userId: string;
		mediaAsset: MediaAsset;
	}): Promise<{ success: boolean; url?: string; error?: string }> {
		if (!this.isEnabled()) {
			throw new Error("Cloud storage is not enabled");
		}

		try {
			const fileName = `${projectId}/${Date.now()}-${mediaAsset.name}`;
			const { data, error } = await supabase.storage
				.from("media-assets")
				.upload(fileName, mediaAsset.file, {
					cacheControl: "3600",
					upsert: false,
				});

			if (error) {
				return {
					success: false,
					error: `Upload failed: ${error.message}`,
				};
			}

			const { data: publicUrlData } = supabase.storage
				.from("media-assets")
				.getPublicUrl(fileName);

			const storageUrl = publicUrlData?.publicUrl;

			if (!storageUrl) {
				return {
					success: false,
					error: "Failed to get public URL",
				};
			}

			await supabase.from("cloud_media_assets").insert({
				id: mediaAsset.id,
				project_id: projectId,
				user_id: userId,
				name: mediaAsset.name,
				type: mediaAsset.type,
				size: mediaAsset.file.size.toString(),
				storage_url: storageUrl,
				thumbnail_url: mediaAsset.thumbnailUrl,
				width: mediaAsset.width?.toString(),
				height: mediaAsset.height?.toString(),
				duration: mediaAsset.duration?.toString(),
				ephemeral: mediaAsset.ephemeral,
			});

			await storageService.saveMediaAsset({ projectId, mediaAsset });

			return {
				success: true,
				url: storageUrl,
			};
		} catch (error) {
			console.error("Media upload error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown upload error",
			};
		}
	}

	async loadMediaAssetFromCloud({
		projectId,
		mediaId,
		userId,
	}: {
		projectId: string;
		mediaId: string;
		userId: string;
	}): Promise<MediaAsset | null> {
		const { data: mediaData, error } = await supabase
			.from("cloud_media_assets")
			.select()
			.eq("id", mediaId)
			.eq("project_id", projectId)
			.single();

		if (error || !mediaData) {
			return null;
		}

		try {
			const fileName = `${projectId}/${mediaData.name}`;
			const { data: fileData, error: downloadError } = await supabase.storage
				.from("media-assets")
				.download(fileName);

			if (downloadError || !fileData) {
				console.error("Failed to download media:", downloadError);
				return null;
			}

			const blob = fileData;
			const file = new File([blob], mediaData.name, { type: mediaData.type });

			return {
				id: mediaData.id,
				name: mediaData.name,
				type: mediaData.type,
				file,
				url: URL.createObjectURL(file),
				width: mediaData.width ? parseInt(mediaData.width) : undefined,
				height: mediaData.height ? parseInt(mediaData.height) : undefined,
				duration: mediaData.duration ? parseFloat(mediaData.duration) : undefined,
				thumbnailUrl: mediaData.thumbnail_url,
				ephemeral: mediaData.ephemeral,
			};
		} catch (error) {
			console.error("Failed to load media from cloud:", error);
			return null;
		}
	}

	async deleteCloudMediaAsset({ projectId, mediaId, userId }: { projectId: string; mediaId: string; userId: string }): Promise<void> {
		const { data: mediaData, error: mediaError } = await supabase
			.from("cloud_media_assets")
			.select()
			.eq("id", mediaId)
			.eq("project_id", projectId)
			.single();

		if (mediaError || !mediaData) {
			throw new Error("Media asset not found");
		}

		const fileName = `${projectId}/${mediaData.name}`;
		const { error: deleteError } = await supabase.storage
			.from("media-assets")
			.remove([fileName]);

		if (deleteError) {
			throw new Error(`Failed to delete media: ${deleteError.message}`);
		}

		await supabase
			.from("cloud_media_assets")
			.delete()
			.eq("id", mediaId);

		await storageService.deleteMediaAsset({ projectId, id: mediaId });
	}
}

export const cloudStorageService = new CloudStorageService();
