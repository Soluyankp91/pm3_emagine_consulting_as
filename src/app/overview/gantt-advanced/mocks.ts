import { GanttGroup, GanttItemInternal } from "@worktile/gantt";
import { MainOverviewItemForWorkflowDto } from "src/shared/service-proxies/service-proxies";

export class GroupOriginItems {
    id:  string;
    title: string;
    origin: MainOverviewItemForWorkflowDto;

    constructor(id: string, title: string, origin: MainOverviewItemForWorkflowDto){
        this.id = id;
        this.title = title;
        this.origin = origin;
    }
}

export declare class GanttGroupInternal<T> {
    id: string;
    title: string;
    origin: GanttGroup<T>;
    items: GanttItemInternal[];
    mergedItems: GanttItemInternal[][];
    expanded?: boolean;
    refs?: {
        height?: number;
    };
    class?: string;
    constructor(group: GanttGroup<T>);
    setExpand(expanded: boolean): void;
}
