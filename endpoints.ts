import { get, post } from "../core/express/wrappers";
import { AnalyticsHandlers } from "./handlers";

export const AnalyticsEndpoints = {
    analytics: {
        aggregate: {
            GET: get(AnalyticsHandlers.aggregate),
        },
        track: {
            POST: post(AnalyticsHandlers.track),
        }
    }
}
