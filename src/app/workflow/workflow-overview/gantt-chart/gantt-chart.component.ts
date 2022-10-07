import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Inject, Input, NgZone, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GanttGlobalConfig, GanttItemInternal, GanttUpper, GANTT_GLOBAL_CONFIG, GANTT_UPPER_TOKEN } from '@worktile/gantt';
import { GanttGroupInternal } from 'src/app/overview/gantt-advanced/mocks';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss'],
  providers: [
    {
        provide: GANTT_UPPER_TOKEN,
        useExisting: GanttChartComponent
    }
]
})
export class GanttChartComponent extends GanttUpper implements OnInit {

    mergeIntervalDays = 0;
    userSelectedStatuses: any;
    menuTopLeftPosition =  {x: 0, y: 0}
    tooltipStartDate: Date | undefined;
    tooltipEndDate: Date | undefined;
    override groups: GanttGroupInternal<any>[] = [];

    @HostBinding('class.gantt-flat') ganttFlatClass = true;

    constructor(
        elementRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        ngZone: NgZone,
        @Inject(GANTT_GLOBAL_CONFIG) config: GanttGlobalConfig,
        private router: Router,
    ) {
        super(elementRef, cdr, ngZone, config);
    }

    private buildGroupMergedItems(items: GanttItemInternal[]) {
        const mergedItems: GanttItemInternal[][] = [];
        items = items.filter((item) => item.start && item.end).sort((a, b) => a.start.getUnixTime() - b.start.getUnixTime());
        // FIXME: temporary commented
        // items.forEach((item) => {
        //     let indexOfMergedItems = -1;
        //     for (let i = 0; i < mergedItems.length; i++) {
        //         const subItems = mergedItems[i];
        //         if (item.start.value > subItems[subItems.length - 1].end.value) {
        //             subItems.push(item);
        //             indexOfMergedItems = i;
        //             break;
        //         }
        //     }
        //     if (indexOfMergedItems === -1) {
        //         mergedItems.push([item]);
        //         indexOfMergedItems = mergedItems.length - 1;
        //     }
        // });
        mergedItems.push(items);
        return mergedItems;
    }

     ngOnInit() {
        super.ngOnInit();
        this.buildGroupItems();
    }

    private buildGroupItems() {
        this.groups.forEach((group) => {
            group.mergedItems = this.buildGroupMergedItems(group.items);
            group.mergedItems = group.mergedItems.length === 0 ? [[]] : group.mergedItems;
        });
    }

    mapListByProperty(list: any[], prop: string) {
        if (list?.length) {
            return list.map(x =>  x[prop]).join(', ');
        } else {
            return '-';
        }
    }

    redirectToWorkflow(id: string) {
        this.router.navigate(['app/workflow', id]);
    }

    employeeProfileUrl(fileToken: string): string {
        if (!fileToken) {
            return 'assets/common/images/no-img.svg';
        }
        return environment.sharedAssets + `/EmployeePicture/${fileToken}.jpg`;
    }

    consultantProfileUrl(fileToken: string): string {
        if (!fileToken) {
            return 'assets/common/images/no-img.svg';
        }
        return `${environment.sharedAssets}/ProfilePicture/${fileToken}.jpg`;
    }

    setPosition(event: MouseEvent, item: any) {
        event.preventDefault();
        this.menuTopLeftPosition.x = event.clientX;
        this.menuTopLeftPosition.y = event.clientY + 10;
        this.tooltipStartDate = (item?.origin?.origin.startDate !== undefined && item?.origin?.origin.startDate !== null) ? new Date(item?.origin?.start*1000) : undefined;
        this.tooltipEndDate = (item?.origin?.origin.endDate !== undefined && item?.origin?.origin.endDate !== null) ? new Date(item?.origin?.end*1000) : undefined;
    }

}
