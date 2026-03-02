import { HandlerArgs } from "../core/express/types";
import { getBody, getHeader, getQuery } from "../core/express/extractors";
import { pipeTo } from "ts-functional";
import { CheckPermissions } from "../uac/permission/util";
import { AnalyticsOptions, AggregateResult, NewAnalyticsEvent, IAnalyticsEvent } from "src/analytics-shared/types";
import { AnalyticsService } from "./services";

class AnalyticsHandlerClass {
    @CheckPermissions("analytics.create")
    public track(...args: HandlerArgs<NewAnalyticsEvent>): Promise<IAnalyticsEvent> {
        return pipeTo(
            (ip: string, userAgent: string, event: NewAnalyticsEvent) => {
                return AnalyticsService.enrichAndCreate(event, ip, userAgent);
            },
            getHeader("ip"),
            getHeader("user-agent"),
            getBody<NewAnalyticsEvent>
        )(args);
    }

    @CheckPermissions("analytics.view")
    public aggregate(...args: HandlerArgs<undefined>): Promise<AggregateResult[]> {
        return pipeTo(
            (query: any) => {
                const options: AnalyticsOptions = {
                    dimension: query.dimension as AnalyticsOptions['dimension'],
                    startDate: query.startDate as string | undefined,
                    endDate: query.endDate as string | undefined
                };
                return AnalyticsService.aggregate(options);
            },
            getQuery
        )(args);
    }
}

export const AnalyticsHandlers = new AnalyticsHandlerClass();
