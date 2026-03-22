import { webEnv } from "@opencut/env/web";

export interface UploadResult {
	success: boolean;
	url?: string;
	error?: string;
}

export interface FileUploadOptions {
	file: File;
	projectId: string;
	userId: string;
}

class CloudStorageUploadService {
	private async getSignedUrl({ key, expiresIn = 3600 }: { key: string; expiresIn?: number }): Promise<string> {
		const url = new URL(`https://${webEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${webEnv.R2_BUCKET_NAME}/${key}`);

		return url.toString();
	}

	async uploadFile({ file, projectId, userId }: FileUploadOptions): Promise<UploadResult> {
		try {
			const fileExtension = file.name.split(".").pop();
			const fileName = `${projectId}/${Date.now()}-${file.name}`;

			const formData = new FormData();
			formData.append("file", file);

			const response = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${webEnv.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${webEnv.R2_BUCKET_NAME}/objects`,
				{
					method: "PUT",
					headers: {
						Authorization: `Bearer ${this.getR2Token()}`,
					},
					body: formData,
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				return {
					success: false,
					error: `Upload failed: ${errorText}`,
				};
			}

			const data = await response.json();
			const publicUrl = `https://pub-${webEnv.R2_ACCOUNT_ID}.r2.dev/${webEnv.R2_BUCKET_NAME}/${fileName}`;

			return {
				success: true,
				url: publicUrl,
			};
		} catch (error) {
			console.error("File upload error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown upload error",
			};
		}
	}

	async deleteFile({ key }: { key: string }): Promise<boolean> {
		try {
			const response = await fetch(
				`https://api.cloudflare.com/client/v4/accounts/${webEnv.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${webEnv.R2_BUCKET_NAME}/objects/${key}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${this.getR2Token()}`,
					},
				},
			);

			return response.ok;
		} catch (error) {
			console.error("File delete error:", error);
			return false;
		}
	}

	private getR2Token(): string {
		return webEnv.R2_SECRET_ACCESS_KEY;
	}

	async uploadMediaAsset({
		file,
		projectId,
		userId,
	}: FileUploadOptions): Promise<{ success: boolean; url?: string; error?: string }> {
		const uploadResult = await this.uploadFile({ file, projectId, userId });

		if (!uploadResult.success || !uploadResult.url) {
			return uploadResult;
		}

		return {
			success: true,
			url: uploadResult.url,
		};
	}
}

export const cloudStorageUploadService = new CloudStorageUploadService();
