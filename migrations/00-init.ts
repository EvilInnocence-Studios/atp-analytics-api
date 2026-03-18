import { database } from "../../core/database";
import { IMigration } from "../../core/dbMigrations";
import { insertPermissions, insertRolePermissions } from "../../uac/migrations/util";
import { analyticsEventsTable } from "./tables";

const db = database();

const permissions = [
    { name: "analytics.view", description: "Can view analytics reports" },
    { name: "analytics.create", description: "Can create analytics events" },
];

const rolePermissions = [
    ...permissions.map(p => ({ roleName: "SuperUser", permissionName: p.name })),
    { roleName: "Public", permissionName: "analytics.create" },
];

export const init: IMigration = {
    name: "init",
    module: "analytics",
    description: "Initial data for analytics module",
    version: "1.0.0",
    order: 3,
    down: () => db.schema
        .dropTableIfExists("analyticsEvents"),
    up: () => db.schema
        .createTable("analyticsEvents", analyticsEventsTable),
    initData: async () => {
        await insertPermissions(db, permissions);
        await insertRolePermissions(db, rolePermissions);
    }
}
