import { Component, OnInit, HostBinding, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { GanttViewType, GanttGroup, GanttItem, GanttDate } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MainOverviewItemPeriodDto, MainOverviewServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
    selector: 'app-gantt-advanced-example',
    templateUrl: './gantt-advanced.component.html'
})
export class AppGanttAdvancedExampleComponent extends AppComponentBase implements OnInit {

    workflowsData: any[] = [];
    consultantsData = [];
    cutOffDate = moment();
    totalCount: number | undefined = 0;
    constructor(
        injector: Injector,
        private router: Router,
        private _mainOverviewService: MainOverviewServiceProxy,
    ) {
        super(injector);

    }

    items: GanttItem[] = [];

    groups: GanttGroup<any>[] = [];

    startDate = new Date();
    options = {
        viewType: GanttViewType.month,
        draggable: false,
        mergeIntervalDays: 3,
        // styles: {
        //     lineHeight: 50,
        //     barHeight: 20
        // }
        dateFormat: {
            yearQuarter: `QQQ 'of' yyyy`,
            month: 'LLL yy',
            week: 'w',
            year: 'yyyy'
        },
        cellWidth: 75,
        start: new GanttDate(getUnixTime(new Date(this.startDate.setDate(this.startDate.getDate() - 7))))
    };

    @HostBinding('class.gantt-example-component') class = true;

    ngOnInit(): void {
        this.getMainOverview();
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
                let groups: GanttGroup<any>[] = [];
                let items: GanttItem[] = [];
                if (result.items?.length) {

                    result.items!.map((x, index) => {
                        groups.push({
                            id: x.workflowId!,
                            title: x.clientDisplayName!,
                            origin: x!
                        })

                        items = [...items, ...this.randomItems(x.clientPeriods?.length!, x.clientPeriods, groups[index].id)];
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
            items.push({
                id: `${parent![i]?.id || group}`,
                title: `${parent![i]?.periodType}`,
                start: getUnixTime(parent![i]?.startDate?.toDate()!),
                end: getUnixTime(parent![i]?.endDate?.toDate()!),
                group_id: group,
                color: parent![i]?.periodType === 'Extend period' ? 'rgb(23, 162, 151)' : 'rgb(250, 173, 25)'
            });
        }
        return items;
    }
}
