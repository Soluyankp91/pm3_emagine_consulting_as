import { Component, OnInit, HostBinding, NgZone, ChangeDetectorRef, ElementRef, Inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { GANTT_UPPER_TOKEN, GanttUpper, GanttItemInternal, GanttGroupInternal, GANTT_GLOBAL_CONFIG, GanttGlobalConfig } from '@worktile/gantt';
import { startWith, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-gantt-flat',
    templateUrl: './flat.component.html',
    styleUrls: ['./flat.scss'],
    providers: [
        {
            provide: GANTT_UPPER_TOKEN,
            useExisting: AppGanttFlatComponent
        }
    ]
})
export class AppGanttFlatComponent extends GanttUpper implements OnInit {
    mergeIntervalDays = 3;

    override groups: GanttGroupInternal[] = [];
    clientDisplayColumns = [
        // 'countryFlag',
        // 'id',
        'process',
        'client',
        // 'clientCountry',
        'consultants',
        'salesManager',
        // 'action',
    ];
    @HostBinding('class.gantt-flat') ganttFlatClass = true;

    constructor(
        elementRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        ngZone: NgZone,
        @Inject(GANTT_GLOBAL_CONFIG) config: GanttGlobalConfig,
        // injector: Injector,
        private router: Router,
    ) {
        super(elementRef, cdr, ngZone, config);

    }

    private buildGroupMergedItems(items: GanttItemInternal[]) {
        const mergedItems: GanttItemInternal[][] = [];
        items = items.filter((item) => item.start && item.end).sort((a, b) => a.start.getUnixTime() - b.start.getUnixTime());
        items.forEach((item) => {
            // let indexOfMergedItems = -1;
            // for (let i = 0; i < mergedItems.length; i++) {
            //     const subItems = mergedItems[i];
            //     if (item.start.value > subItems[subItems.length - 1].end.addDays(this.mergeIntervalDays).value) {
            //         subItems.push(item);
            //         indexOfMergedItems = i;
            //         break;
            //     }
            // }
            // 如果没有合适的位置插入，则插入到最后一行
            // if (indexOfMergedItems === -1) {
                // indexOfMergedItems = mergedItems.length - 1;
                // }
            });
        mergedItems.push(items);
        return mergedItems;
    }

     ngOnInit() {
        super.ngOnInit();
        // this.dragEnded.pipe(startWith<null, null>(null), takeUntil(this.unsubscribe$)).subscribe(() => {
            this.buildGroupItems();
        // });
    }

    private buildGroupItems() {
        console.log(this.groups);
        debugger;
        this.groups.forEach((group) => {
            group.mergedItems = this.buildGroupMergedItems(group.items);
            // 如果没有数据，默认填充两行空行
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
            return 'assets/common/images//no-img.svg';
        }
        return environment.sharedAssets + `/EmployeePicture/${fileToken}.jpg`;
    }
}
