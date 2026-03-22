import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load the right env file based on environment
const nodeEnv = process.env.NODE_ENV || "development";
if (nodeEnv === "production") {
	dotenv.config({ path: ".env.production" });
} else {
	dotenv.config({ path: ".env.local" });
}

import { webEnv } from "@opencut/env/web";

export default {
	schema: "./src/lib/db/schema.ts",
	dialect: "postgresql",
	migrations: {
		table: "drizzle_migrations",
	},
	dbCredentials: {
		url: webEnv.DATABASE_URL,
	},
	out: "./migrations",
	strict: nodeEnv === "production",
} satisfies Config;
