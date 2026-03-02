import { AnalyticsOptions, AggregateResult, IAnalyticsEvent, NewAnalyticsEvent } from "src/analytics-shared/types";
import { basicCrudService } from "../core/express/service/common";
import { database } from "../core/database";
import { UAParser } from "ua-parser-js";
import axios from "axios";

const AnalyticsBasic = basicCrudService<IAnalyticsEvent>("analyticsEvents");

export const AnalyticsService = {
    ...AnalyticsBasic,
    enrichAndCreate: async (event: NewAnalyticsEvent, ip: string, userAgentStr: string): Promise<IAnalyticsEvent> => {
        // Parse the user agent
        const parser = new UAParser(userAgentStr);
        const result = parser.getResult();

        let geoCountry, geoRegion, geoCity;

        // Lookup geolocation from IP Address (example using ip-api.com)
        // Skip for local IPs or if not provided
        if (ip && ip !== "::1" && ip !== "127.0.0.1") {
            try {
                // Remove ipv6 mapping if present to standard ipv4
                const ipv4 = ip.includes("::ffff:") ? ip.split("::ffff:")[1] : ip;
                const response = await axios.get(`http://ip-api.com/json/${ipv4}`);
                if (response.data && response.data.status === 'success') {
                    geoCountry = response.data.country;
                    geoRegion = response.data.regionName;
                    geoCity = response.data.city;
                }
            } catch (error) {
                console.error("Failed to fetch geo data for IP:", ip, error);
            }
        }

        const enrichedEvent: Omit<IAnalyticsEvent, "id"> = {
            ...event,
            timestamp: new Date(),
            ipAddress: ip,
            userAgent: userAgentStr,
            browserName: result.browser.name,
            browserVersion: result.browser.version,
            os: result.os.name,
            geoCountry,
            geoRegion,
            geoCity,
        };
        console.log(enrichedEvent);
        return AnalyticsBasic.create(enrichedEvent);
    },
    aggregate: async (options: AnalyticsOptions): Promise<AggregateResult[]> => {
        const db = database();
        let query = db("analyticsEvents");

        if (options.startDate) {
            query = query.where("timestamp", ">=", options.startDate);
        }
        if (options.endDate) {
            query = query.where("timestamp", "<=", options.endDate);
        }

        let groupCol: string;

        switch (options.dimension) {
            case "day": groupCol = "DATE_TRUNC('day', timestamp)"; break;
            case "week": groupCol = "DATE_TRUNC('week', timestamp)"; break;
            case "month": groupCol = "DATE_TRUNC('month', timestamp)"; break;
            case "dayOfWeek": groupCol = "EXTRACT(DOW FROM timestamp)"; break;
            case "timeOfDay": groupCol = "EXTRACT(HOUR FROM timestamp)"; break;
            case "country": groupCol = `"geoCountry"`; break;
            case "page": groupCol = `"url"`; break;
            case "referrer": groupCol = `"referrer"`; break;
            default: throw new Error("Invalid dimension");
        }

        const results = await query
            .select(db.raw(`${groupCol} as label`))
            .count("id as views")
            .countDistinct("ipAddress as uniqueUsers")
            .groupByRaw(groupCol)
            .orderBy("label", "asc");

        return results.map(r => ({
            label: r.label as string | number,
            views: Number(r.views),
            uniqueUsers: Number(r.uniqueUsers)
        }));
    }
}
