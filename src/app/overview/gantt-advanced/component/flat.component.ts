import { Component, OnInit, HostBinding, NgZone, ChangeDetectorRef, ElementRef, Inject, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GANTT_UPPER_TOKEN, GanttUpper, GanttItemInternal, GANTT_GLOBAL_CONFIG, GanttGlobalConfig } from '@worktile/gantt';
import { environment } from 'src/environments/environment';
import { AppConsts } from 'src/shared/AppConsts';
import { MainOverviewServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { OverviewFlag, OverviewFlagNames } from '../../main-overview.model';
import { GanttGroupInternal } from '../mocks';

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
    @Input() isConsultants: boolean;
    @Input() isWorkflow: boolean;

    @Output() userSelectedStatusForWorflow = new EventEmitter();
    @Output() userSelectedStatusForConsultant = new EventEmitter();

    momentFormatType = AppConsts.momentFormatType;
    overviewFlagNames = OverviewFlagNames;
    mergeIntervalDays = 3;
    userSelectedStatuses: any;
    menuTopLeftPosition =  {x: 0, y: 0}
    tooltipStartDate: Date;
    tooltipEndDate: Date | undefined;
    override groups: GanttGroupInternal<any>[] = [];
    clientDisplayColumns = [
        'process',
        'client',
        'consultants',
        'salesManager',
    ];
    @HostBinding('class.gantt-flat') ganttFlatClass = true;

    constructor(
        elementRef: ElementRef<HTMLElement>,
        cdr: ChangeDetectorRef,
        ngZone: NgZone,
        @Inject(GANTT_GLOBAL_CONFIG) config: GanttGlobalConfig,
        private router: Router,
        private _mainOverviewService: MainOverviewServiceProxy,

    ) {
        super(elementRef, cdr, ngZone, config);
    }

    private buildGroupMergedItems(items: GanttItemInternal[]) {
        const mergedItems: GanttItemInternal[][] = [];
        items = items.filter((item) => item.start && item.end).sort((a, b) => a.start.getUnixTime() - b.start.getUnixTime());
        items.forEach((item) => {
            let indexOfMergedItems = -1;
            for (let i = 0; i < mergedItems.length; i++) {
                const subItems = mergedItems[i];
                if (item.start.value > subItems[subItems.length - 1].end.addDays(this.mergeIntervalDays).value) {
                    subItems.push(item);
                    indexOfMergedItems = i;
                    break;
                }
            }
            if (indexOfMergedItems === -1) {
                mergedItems.push([item]);
                indexOfMergedItems = mergedItems.length - 1;
            }
        });
        // mergedItems.push(items);
        return mergedItems;
    }

     ngOnInit() {
        super.ngOnInit();
        this.buildGroupItems();
        this.getMainOverviewStatuses();
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
            return 'assets/common/images//no-img.svg';
        }
        return environment.sharedAssets + `/EmployeePicture/${fileToken}.jpg`;
    }

    detectProcessColor(process: number) {
        switch (process) {
            case OverviewFlag.ExtensionExpected:
            case OverviewFlag.Extended:
            case OverviewFlag.Started:
                return 'overview-extensions-icon';
            case OverviewFlag.Terminated:
            case OverviewFlag.ExpectedToTerminate:
                return 'overview-termination-icon';
            case OverviewFlag.ExtensionInNegotiation:
                return 'overview-negotiation-icon';
            case OverviewFlag.RequiresAttention:
                return 'overview-attention-icon';
            default:
                return '';
        }
    }

    detectIcon(process: number) {
        switch (process) {
            case OverviewFlag.ExtensionExpected:
                return 'check-circle';
            case OverviewFlag.Extended:
            case OverviewFlag.Started:
                return 'check-circle-fill';
            case OverviewFlag.ExpectedToTerminate:
                return 'cancel';
            case OverviewFlag.Terminated:
                return 'cancel-fill';
            case OverviewFlag.ExtensionInNegotiation:
                return 'schedule';
            case OverviewFlag.RequiresAttention:
                return 'warning';
            default:
                return '';
        }
    }

    getMainOverviewStatuses() {
        this._mainOverviewService.statuses().subscribe(result => {
            this.userSelectedStatuses = result.filter(x => x.canBeSetByUser);
        })
    }

    setUserSelectedStatusForWorflow(workflowId: string, userSelectedStatus: number) {
        let ids = {workflowId: workflowId, userSelectedStatus: userSelectedStatus}
        this.userSelectedStatusForWorflow.emit(ids);
    }

    setUserSelectedStatusForConsultant(workflowId: string, consultantId: number, userSelectedStatus: number) {
        let ids = {workflowId: workflowId, consultantId: consultantId, userSelectedStatus: userSelectedStatus}
        this.userSelectedStatusForConsultant.emit(ids);
    }

    setPosition(event: MouseEvent, item: any) {
        event.preventDefault();
        this.menuTopLeftPosition.x = event.clientX;
        this.menuTopLeftPosition.y = event.clientY + 10;
        this.tooltipStartDate = new Date(item?.origin?.start*1000) ;
        this.tooltipEndDate = (item?.origin?.origin.endDate !== undefined && item?.origin?.origin.endDate !== null) ? new Date(item?.origin?.end*1000) : undefined;

    }

}
