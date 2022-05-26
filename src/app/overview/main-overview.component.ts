import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GanttDate, GanttItem, GanttViewOptions, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, EmployeeDto, EnumEntityTypeDto, LookupServiceProxy, MainOverviewServiceProxy, MainOverviewStatus, MainOverviewStatusDto } from 'src/shared/service-proxies/service-proxies';
import { SelectableCountry, SelectableIdNameDto } from '../client/client.model';
import { InternalLookupService } from '../shared/common/internal-lookup.service';
import { ManagerStatus } from '../shared/components/manager-search/manager-search.model';
import { MainOverviewStatuses, OverviewData, OverviewFlag, SelectableEmployeeDto, SelectableStatusesDto } from './main-overview.model';
import * as moment from 'moment';
import { MsalService } from '@azure/msal-angular';

@Component({
    selector: 'app-main-overview',
    templateUrl: './main-overview.component.html',
    styleUrls: ['./main-overview.component.scss']
})
export class MainOverviewComponent implements OnInit, AfterViewInit {
    @ViewChild('gantt') ganttComponent: NgxGanttComponent;

    workflowFilter = new FormControl(null);
    accountManagerFilter = new FormControl();
    selectedAccountManagers: SelectableEmployeeDto[] = [];
    filteredAccountManagers: SelectableEmployeeDto[] = [];

    pageNumber = 1;
    deafultPageSize = AppConsts.grid.defaultPageSize;
    pageSizeOptions = [5, 10, 20, 50, 100];
    totalCount: number | undefined = 0;
    sorting = '';
    isDataLoading = false;

    tenants: EnumEntityTypeDto[] = [];
    saleTypes: EnumEntityTypeDto[] = [];
    projectTypes: EnumEntityTypeDto[] = [];
    margins: EnumEntityTypeDto[] = [];
    isAdvancedFilters = false;
    showOnlyWorkflowsWithNewSales = false;
    showOnlyWorkflowsWithExtensions = false;
    showOnlyWorkflowsWithPendingStepsForSelectedEmployees = false;
    showOnlyWorkflowsWithUpcomingStepsForSelectedEmployees = false;
    includeTerminated = false;
    includeDeleted = false;
    invoicingEntityControl = new FormControl();
    paymentEntityControl = new FormControl();
    salesTypeControl = new FormControl();
    projectTypeControl = new FormControl();
    marginsControl = new FormControl();

    managerStatus = ManagerStatus;
    mainOverviewStatuses: MainOverviewStatusDto;
    filteredMainOverviewStatuses: SelectableStatusesDto[] = [];

    // gant
    items: GanttItem<OverviewData>[] = [
        { id: '000000', title: 'Leadership support', color: 'rgb(250, 173, 25)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.Extended }, start: getUnixTime(new Date(2022, 5, 1)), end: getUnixTime(new Date(2022, 8, 3))},
        { id: '000001', title: 'Leadership support', color: 'rgb(250, 173, 25)', origin: {  firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.ExtensionExpected }, start: getUnixTime(new Date(2022, 5, 2)), end: getUnixTime(new Date(2022, 9, 2))},
        { id: '000002', title: 'Leadership support', color: 'rgb(23, 162, 151)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.Terminated }, start: getUnixTime(new Date(2022, 5, 1)), end: getUnixTime(new Date(2022, 9, 3))},
        { id: '000003', title: 'Leadership support', color: 'rgb(139, 209, 203)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.ExpectedToTerminate }, start: getUnixTime(new Date(2022, 6, 1)), end: getUnixTime(new Date(2022, 8, 25))},
        { id: '000004', title: 'Leadership support', color: 'rgb(139, 209, 203)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.ExtensionInNegotiation }, start: getUnixTime(new Date(2022, 7, 1)), end: getUnixTime(new Date(2022, 11, 30))},
        { id: '000005', title: 'Leadership support', color: 'rgb(23, 162, 151)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.RequiresAttention }, start: getUnixTime(new Date(2022, 6, 1)), end: getUnixTime(new Date(2022, 10, 6))}
    ];

    viewType: FormControl = new FormControl(GanttViewType.month);

    viewOptions: GanttViewOptions = {
        // min: new GanttDate(new Date(2022, 1, 1)),
        // max: new GanttDate(new Date(2022, 11, 31)),
        dateFormat: {
            yearQuarter: `QQQ 'of' yyyy`,
            month: 'LLL yy',
            week: 'w',
            year: 'yyyy'
        },
        cellWidth: 75
    }

    views = [
        {
            name: 'Week view',
            value: GanttViewType.week
        },
        {
            name: 'Month view',
            value: GanttViewType.month
        }
    ];

    private _unsubscribe = new Subject();

    constructor(
        private _lookupService: LookupServiceProxy,
        private _apiService: ApiServiceProxy,
        private _internalLookupService: InternalLookupService,
        private _mainOverviewService: MainOverviewServiceProxy,
        private _auth: MsalService

    ) {
        this.accountManagerFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(300),
            switchMap((value: any) => {
                let toSend = {
                    name: value,
                    maxRecordsCount: 1000,
                };
                if (value?.id) {
                    toSend.name = value.id
                        ? value.name
                        : value;
                }
                return this._lookupService.employees(value);
            }),
        ).subscribe((list: EmployeeDto[]) => {
            if (list.length) {
                this.filteredAccountManagers = list.map(x => {
                    return new SelectableEmployeeDto({
                        id: x.id!,
                        name: x.name!,
                        externalId: x.externalId!,
                        selected: false
                    })
                });
            } else {
                this.filteredAccountManagers = [{ name: 'No managers found', externalId: '', id: 'no-data', selected: false }];
            }
        });

        this.invoicingEntityControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getMainOverview();
        });

        this.paymentEntityControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getMainOverview();
        });

        this.salesTypeControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getMainOverview();
        });

        this.projectTypeControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getMainOverview();
        });

        this.marginsControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.getMainOverview();
        });
     }

    ngOnInit(): void {
        // this.getMainOverview();
        this.getTenants();
        this.getSalesType();
        this.getProjectType();
        this.getMargins();
        this.getMainOverviewStatuses();
        this.getCurrentUser();
        // this.changeViewType(GanttViewType.month);
    }

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
        this.changeViewType(GanttViewType.month);

    }

    ngOnDestroy(): void {
        this._unsubscribe.next();
        this._unsubscribe.complete();
    }

    detectProcessColor(process: OverviewFlag) {
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
            case OverviewFlag.Extended:
                return 'check-circle';
            case OverviewFlag.ExtensionExpected:
            case OverviewFlag.Started:
                return 'check-circle-fill';
            case OverviewFlag.Terminated:
                return 'cancel';
            case OverviewFlag.ExpectedToTerminate:
                return 'cancel-fill';
            case OverviewFlag.ExtensionInNegotiation:
                return 'schedule';
            case OverviewFlag.RequiresAttention:
                return 'warning';
            default:
                return '';
        }
    }

    // convertDateToTimestamp(value: any) {
    //     var myDate = value;
    //     myDate = myDate.split("-");
    //     var newDate = new Date( myDate[2], myDate[1] - 1, myDate[0]);
    //     return newDate.getTime()/1000;
    // }

    changeViewType(type: any) {
        this.viewType.setValue(type);
        switch (type) {
            case 'week':
                this.viewOptions.cellWidth = 50;
                let cutOffDateWeek = new Date();
                // let maxDate = new Date();
                cutOffDateWeek.setDate(cutOffDateWeek.getDate() - 35)
                // maxDate.setDate(364 - maxDate.getDate() + 35);
                this.ganttComponent.viewOptions.start = new GanttDate(getUnixTime(new Date(this.formatDate(cutOffDateWeek))));
                // this.ganttComponent.viewOptions.end = new GanttDate(getUnixTime(new Date(maxDate.getFullYear(), 11, 31)));
                this.ganttComponent.viewChange.emit();
                console.log(this.formatDate(cutOffDateWeek));
                // console.log(this.formatDate(maxDate));
                this.getMainOverview(cutOffDateWeek);
                break;
            case 'month':
                this.viewOptions.cellWidth = 75;
                let cutOffDateMonth = new Date();
                let maxMonth = new Date();
                cutOffDateMonth.setMonth(cutOffDateMonth.getMonth() - 1)
                // maxMonth.setMonth(12 + maxMonth.getMonth() + 1);
                this.ganttComponent.viewOptions.start = new GanttDate(getUnixTime(new Date(this.formatDate(cutOffDateMonth))));
                this.ganttComponent.viewOptions.end = new GanttDate(getUnixTime(new Date(maxMonth.getFullYear(), 11, 31)))
                this.ganttComponent.viewChange.emit();
                console.log(this.formatDate(cutOffDateMonth));
                console.log(this.formatDate(maxMonth));
                this.getMainOverview(cutOffDateMonth);

                break;
        }
    }

    formatDate(date: any) {
        var d = new Date(date),
            month = (d.getMonth() + 1),
            day = d.getDate(),
            year = d.getFullYear();

        // if (month.length < 2)
        //     month = '0' + month;
        // if (day.length < 2)
        //     day = '0' + day;

        return [year, month, day].join(',');
    }

    mapListByProperty(list: any[], prop: string) {
        if (list?.length) {
            return list.map(x =>  x[prop]).join(', ');
        } else {
            return '-';
        }
    }

    getMainOverview(date?: any) {
        this.isDataLoading = true;
        let searchFilter = this.workflowFilter.value ? this.workflowFilter.value : '';
        let ownerIds = this.selectedAccountManagers.map(x => +x.id);
        let invoicingEntity = this.invoicingEntityControl.value ?? undefined;
        let paymentEntity = this.paymentEntityControl.value ?? undefined;
        let salesType = this.salesTypeControl.value ?? undefined;
        let projectType = this.projectTypeControl.value ?? undefined;
        let margins = this.marginsControl.value ?? undefined;
        let mainOverviewStatus = this.filteredMainOverviewStatuses.find(x => x.selected);
        let cutOffDate = date;

        this._apiService.mainOverview(
            mainOverviewStatus?.id,
            // MainOverviewStatus[mainOverviewStatus?.id!],
            ownerIds,
            invoicingEntity,
            paymentEntity,
            salesType,
            projectType,
            margins,
            searchFilter,
            cutOffDate,
            this.pageNumber,
            this.deafultPageSize,
            this.sorting)
            .pipe(finalize(() => {
                this.isDataLoading = false;
            }))
            .subscribe(result => {
                console.log(result);

                // this.clientDataSource = new MatTableDataSource<ClientListItemDto>(result.items);
                this.totalCount = result.totalCount;
            });
    }

    optionClicked(event: Event, item: SelectableIdNameDto | SelectableCountry | SelectableEmployeeDto, list: SelectableIdNameDto[] | SelectableCountry[] | SelectableEmployeeDto[]) {
        event.stopPropagation();
        this.toggleSelection(item, list);
      }

    toggleSelection(item: any, list: any) {
        item.selected = !item.selected;
        if (item.selected) {
            if (!list.includes(item)) {
                list.push(item);
            }
        } else {
            const i = list.findIndex((value: any) => value.name === item.name);
            list.splice(i, 1);
        }
        this.getMainOverview();
    }

    getTenants() {
        this._internalLookupService.getTenants()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.tenants = result;
            });
    }

    getSalesType() {
        this._internalLookupService.getSaleTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.saleTypes = result;
            });
    }

    getProjectType() {
        this._internalLookupService.getProjectTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.projectTypes = result;
            });
    }

    getMargins() {
        this._internalLookupService.getMargins()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.margins = result;
            });
    }

    getMainOverviewStatuses() {
        this._mainOverviewService.statuses().subscribe(result => {
            this.filteredMainOverviewStatuses = result.map(x => {
                return new SelectableStatusesDto({
                    id: x.id!,
                    name: x.name!,
                    canBeSetAutomatically: x.canBeSetAutomatically!,
                    canBeSetByUser: x.canBeSetByUser!,
                    selected: false,
                    flag: this.detectIcon(x.id!)
                })
            });

        })
    }

    changeOverviewStatus(status: SelectableStatusesDto) {
        this.filteredMainOverviewStatuses.forEach(x => {
            if (x.id !== status.id) {
                x.selected = false;
            }
        })
        status.selected = !status.selected;
        this.getMainOverview();
    }

    statusesTrackBy(index: number, item: SelectableStatusesDto) {
        return item.id;
    }

    getCurrentUser() {
        let currentLoggedUser = this._auth.instance.getActiveAccount();
        console.log(currentLoggedUser);

        let toSend = {
            name: currentLoggedUser!.name,
            maxRecordsCount: 1000,
        };

        this._lookupService.employees(toSend.name)
            .pipe(finalize(()=> this.getMainOverview()))
            .subscribe(result => {
                this.selectedAccountManagers = result.map(x => {
                    return new SelectableEmployeeDto({
                        id: x.id!,
                        name: x.name!,
                        externalId: x.externalId!,
                        selected: true
                    })
                });
            });
    }

    // calculateCutoffDate() {
    //     switch (this.viewType) {
    //         case value:

    //             break;

    //         default:
    //             break;

    // }
}
