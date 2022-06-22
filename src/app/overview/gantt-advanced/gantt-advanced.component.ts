import { Component, OnInit, HostBinding } from '@angular/core';
import { GanttViewType, GanttGroup, GanttItem } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { MainOverviewItemForWorkflowDto, MainOverviewItemPeriodDto, MainOverviewServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { randomGroupsAndItems } from '../helper';

@Component({
    selector: 'app-gantt-advanced-example',
    templateUrl: './gantt-advanced.component.html'
})
export class AppGanttAdvancedExampleComponent implements OnInit {

    workflowsData: any[] = [];
    consultantsData = [];
    cutOffDate = moment();
    totalCount: number | undefined = 0;
    constructor(
        private _mainOverviewService: MainOverviewServiceProxy,

    ) {}

    items: GanttItem[] = [];

    groups: GanttGroup[] = [];

    options = {
        viewType: GanttViewType.month,
        draggable: true,
        mergeIntervalDays: 1,
        styles: {
            lineHeight: 50,
            barHeight: 20
        }
    };

    @HostBinding('class.gantt-example-component') class = true;

    ngOnInit(): void {
        // const { groups, items } = randomGroupsAndItems
        this.getMainOverview();
        // this.groups = groups;
        // this.items = items;

        // console.log(this.groups, this.items);
    }

    getMainOverview(date?: any) {
        let searchFilter = '';
        let ownerIds: any[] = [];
        let invoicingEntity =  1;
        let paymentEntity = undefined;
        let salesType =  undefined;
        let deliveryType =  undefined;
        let margins =  undefined;
        let mainOverviewStatus = {id: undefined};
        if (date) {
            this.cutOffDate = date;
        }
        this.workflowsData = [];
        this.consultantsData = [];
        this._mainOverviewService.workflows(mainOverviewStatus?.id, ownerIds, invoicingEntity, paymentEntity, salesType, deliveryType, margins, searchFilter, this.cutOffDate, 1, 20,'')
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                let groups: GanttGroup[] = [];
                let items: GanttItem[] = [];
                if (result.items?.length) {

                    result.items!.map((x, index) => {
                        // let formattedData: GanttItem<MainOverviewItemForWorkflowDto>;
                        // formattedData = {
                        groups.push({
                            id: x.workflowId!,
                            title: x.clientDisplayName!,
                            // start: getUnixTime(x.clientPeriods![0]?.startDate!.toDate()),
                            // end: getUnixTime(x.clientPeriods![0]?.endDate!.toDate()),
                            origin: x,
                            // color: 'rgb(23, 162, 151)',
                            // group_id: x.clientPeriods?.length! > 1 ? x.workflowId : undefined
                        })
                        items = [...items, ...this.randomItems(x.clientPeriods?.length!, x.clientPeriods, groups[index].id)];
                        // return formattedData;
                    });

                }
                this.totalCount = result.totalCount;
                console.log(groups, items);
                this.groups = groups;
                this.items = items;
            });

    }

randomItems(length: number, parent?: MainOverviewItemPeriodDto[], group?: string) {
        const items = [];
        for (let i = 0; i < length; i++) {
            // const start = addDays(new Date(), random(-200, 200));
            // const end = addDays(start, random(0, 100));
            items.push({
                id: `${parent![i]?.id || group || ''}`,
                title: `${parent![i]?.periodType || 'Task'}`,
                start: getUnixTime(parent![i]?.startDate?.toDate()!),
                end: getUnixTime(parent![i]?.endDate?.toDate()!),
                group_id: group,
                color: parent![i]?.periodType === 'Extend period' ? 'rgb(23, 162, 151)' : 'rgb(250, 173, 25)'
            });
        }
        return items;
    }

    // randomGroupsAndItems(length: number) {
    //     const groups: GanttGroup[] = [];
    //     let items: GanttItem[] = [];
    //     for (let i = 0; i < length; i++) {
    //         groups.push({
    //             id: `00000${i}`,
    //             title: `Group-${i}`
    //         });
    //         items = [...items, ...randomItems(6, undefined, groups[i].id)];
    //     }
    //     return {
    //         groups,
    //         items
    //     };
    // }
}
