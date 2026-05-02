import { init } from "../analytics/migrations/00-init";

export { AnalyticsEndpoints as apiConfig } from "./endpoints";

export const migrations = [init];
export const setupMigrations = [init];
