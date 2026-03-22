import { pgTable, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: text("id").primaryKey(),

	// todo: implement fully anonymous sign-in for privacy
	// we don't have any auth flows currently so this is fine for now
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
}).enableRLS();

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
}).enableRLS();

export const accounts = pgTable("accounts", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
}).enableRLS();

export const verifications = pgTable("verifications", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: timestamp("updated_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
}).enableRLS();

export const cloudProjects = pgTable("cloud_projects", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	thumbnail: text("thumbnail"),
	duration: text("duration"),
	version: text("version").default("1"),
	settings: jsonb("settings").$type<any>(),
	timelineViewState: jsonb("timeline_view_state").$type<any>(),
	isPublic: boolean("is_public").default(false).notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
	updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
}).enableRLS();

export const cloudScenes = pgTable("cloud_scenes", {
	id: text("id").primaryKey(),
	projectId: text("project_id").notNull().references(() => cloudProjects.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	isMain: boolean("is_main").default(false).notNull(),
	tracks: jsonb("tracks").$type<any>(),
	bookmarks: jsonb("bookmarks").$type<any>(),
	createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
	updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
}).enableRLS();

export const cloudMediaAssets = pgTable("cloud_media_assets", {
	id: text("id").primaryKey(),
	projectId: text("project_id").notNull().references(() => cloudProjects.id, { onDelete: "cascade" }),
	userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	type: text("type").notNull(),
	size: text("size").notNull(),
	storageUrl: text("storage_url").notNull(),
	thumbnailUrl: text("thumbnail_url"),
	width: text("width"),
	height: text("height"),
	duration: text("duration"),
	ephemeral: boolean("ephemeral").default(false).notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
}).enableRLS();
