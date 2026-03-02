import { Knex } from "knex";

export const analyticsEventsTable = (t: Knex.CreateTableBuilder) => {
    t.bigIncrements();

    t.text("url").notNullable();
    t.string("host", 255).notNullable();
    t.text("referrer").nullable();

    t.text("userAgent").nullable();
    t.string("browserName", 255).nullable();
    t.string("browserVersion", 255).nullable();
    t.string("os", 255).nullable();

    t.string("ipAddress", 255).nullable();
    t.string("geoCountry", 255).nullable();
    t.string("geoRegion", 255).nullable();
    t.string("geoCity", 255).nullable();

    t.integer("screenWidth").nullable();
    t.integer("screenHeight").nullable();

    t.dateTime("timestamp").notNullable();

    t.index(["timestamp"]);
    t.index(["geoCountry"]);
    t.index(["url"]);
    t.index(["referrer"]);
    t.index(["ipAddress"]);
};
