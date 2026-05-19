import { FieldRegistry } from "@core/express/util";
import { init } from "../analytics/migrations/00-init";

export { AnalyticsEndpoints as apiConfig } from "./endpoints";

export const migrations = [init];
export const setupMigrations = [init];

FieldRegistry.register(
    "analyticsEvents", {
        create: [
            "url", "host", "referrer", "userAgent", "browserName", "browserVersion", "os",
            "ipAddress", "geoCountry", "geoRegion", "geoCity", "screenWidth", "screenHeight", "timestamp"
        ],
        update: [],
    }
);
