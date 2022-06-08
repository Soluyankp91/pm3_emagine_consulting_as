import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GanttDate, GanttItem, GanttViewOptions, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, EmployeeDto, EmployeeServiceProxy, EnumEntityTypeDto, LookupServiceProxy, MainOverviewItemForConsultantDto, MainOverviewItemForWorkflowDto, MainOverviewServiceProxy, MainOverviewStatusDto } from 'src/shared/service-proxies/service-proxies';
import { SelectableCountry, SelectableIdNameDto } from '../client/client.model';
import { InternalLookupService } from '../shared/common/internal-lookup.service';
import { ManagerStatus } from '../shared/components/manager-search/manager-search.model';
import { OverviewFlag, SelectableEmployeeDto, SelectableStatusesDto } from './main-overview.model';
import { MsalService } from '@azure/msal-angular';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { AppComponentBase } from 'src/shared/app-component-base';

@Component({
    selector: 'app-main-overview',
    templateUrl: './main-overview.component.html',
    styleUrls: ['./main-overview.component.scss']
})
export class MainOverviewComponent extends AppComponentBase implements OnInit {
    @ViewChild('ganttWorkflows', {static: false}) ganttWorkflows: NgxGanttComponent;
    @ViewChild('ganttConsultants', {static: false}) ganttConsultants: NgxGanttComponent;

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
    deliveryTypes: EnumEntityTypeDto[] = [];
    margins: EnumEntityTypeDto[] = [];
    isAdvancedFilters = false;

    workflowFilter = new FormControl(null);
    accountManagerFilter = new FormControl();
    invoicingEntityControl = new FormControl();
    paymentEntityControl = new FormControl();
    salesTypeControl = new FormControl();
    deliveryTypesControl = new FormControl();
    marginsControl = new FormControl();
    overviewViewTypeControl = new FormControl(1);

    managerStatus = ManagerStatus;
    mainOverviewStatuses: MainOverviewStatusDto;
    filteredMainOverviewStatuses: SelectableStatusesDto[] = [];
    overviewViewTypes: { [key: string]: string };
    cutOffDate = moment();
    userSelectedStatuses: any;

    // gant

    // items: GanttItem<OverviewData>[] = [
    //     { id: '000000', title: 'Leadership support', color: 'rgb(250, 173, 25)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.Extended }, start: getUnixTime(new Date(2022, 5, 1)), end: getUnixTime(new Date(2022, 8, 3))},
    //     { id: '000001', title: 'Leadership support', color: 'rgb(250, 173, 25)', origin: {  firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.ExtensionExpected }, start: getUnixTime(new Date(2022, 5, 2)), end: getUnixTime(new Date(2022, 9, 2))},
    //     { id: '000002', title: 'Leadership support', color: 'rgb(23, 162, 151)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.Terminated }, start: getUnixTime(new Date(2022, 5, 1)), end: getUnixTime(new Date(2022, 9, 3))},
    //     { id: '000003', title: 'Leadership support', color: 'rgb(139, 209, 203)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.ExpectedToTerminate }, start: getUnixTime(new Date(2022, 6, 1)), end: getUnixTime(new Date(2022, 8, 25))},
    //     { id: '000004', title: 'Leadership support', color: 'rgb(139, 209, 203)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.ExtensionInNegotiation }, start: getUnixTime(new Date(2022, 7, 1)), end: getUnixTime(new Date(2022, 11, 30))},
    //     { id: '000005', title: 'Leadership support', color: 'rgb(23, 162, 151)', origin: { firstName: 'Frederick', lastName: 'Rikke', process: OverviewFlag.RequiresAttention }, start: getUnixTime(new Date(2022, 6, 1)), end: getUnixTime(new Date(2022, 10, 6))}
    // ];

    workflowsData: any[] = [];
    consultantsData: any[] = [];

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
        injector: Injector,
        private _lookupService: LookupServiceProxy,
        private _internalLookupService: InternalLookupService,
        private _mainOverviewService: MainOverviewServiceProxy,
        private router: Router,
        private _employeeService: EmployeeServiceProxy,

    ) {
        super(injector);
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
            this.changeViewType();
        });

        this.paymentEntityControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.salesTypeControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.deliveryTypesControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.marginsControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.overviewViewTypeControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.workflowFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(500)
        ).subscribe(() => {
            this.changeViewType();
        });
     }

    ngOnInit(): void {
        this.getTenants();
        this.getSalesType();
        this.getDeliveryTypes();
        this.getMargins();
        this.getMainOverviewStatuses();
        this.getOverviewViewTypes();
        this.getCurrentUser();
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

    changeViewType() {
        switch (this.viewType.value) {
            case 'week':
                let cutOffDateWeek = new Date();
                cutOffDateWeek.setDate(cutOffDateWeek.getDate() - 35);
                this.viewOptions.cellWidth = 50;
                this.getMainOverview(cutOffDateWeek);
                break;
            case 'month':
                let cutOffDateMonth = new Date();
                cutOffDateMonth.setMonth(cutOffDateMonth.getMonth() - 1)
                this.viewOptions.cellWidth = 75;
                this.getMainOverview(cutOffDateMonth);
                break;
        }
    }

    formatDate(date: any) {
        var d = new Date(date),
            month = (d.getMonth() + 1),
            day = d.getDate(),
            year = d.getFullYear();

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
        let deliveryType = this.deliveryTypesControl.value ?? undefined;
        let margins = this.marginsControl.value ?? undefined;
        let mainOverviewStatus = this.filteredMainOverviewStatuses.find(x => x.selected);

        if (date) {
            // this.cutOffDate = moment(date).format('YYYY-MM-DD')
            this.cutOffDate = date;

        }
        this.workflowsData = [];
        this.consultantsData = [];
        this.showMainSpinner();
        switch (this.overviewViewTypeControl.value) {
            case 1: // 'Client periods':
                this._mainOverviewService.workflows(
                    mainOverviewStatus?.id,
                    ownerIds,
                    invoicingEntity,
                    paymentEntity,
                    salesType,
                    deliveryType,
                    margins,
                    searchFilter,
                    this.cutOffDate,
                    this.pageNumber,
                    this.deafultPageSize,
                    this.sorting)
                    .pipe(finalize(() => {
                        this.isDataLoading = false;
                        this.hideMainSpinner();
                    }))
                    .subscribe(result => {
                        if (result.items?.length) {
                            this.workflowsData = result.items!.map(x => {
                                let formattedData: GanttItem<MainOverviewItemForWorkflowDto>;
                                formattedData = {
                                    id: x.workflowId!,
                                    title: x.clientDisplayName!,
                                    start: getUnixTime(x.clientPeriods![0]?.startDate!.toDate()),
                                    end: x.clientPeriods![0]?.endDate ? getUnixTime(x.clientPeriods![0]?.endDate!.toDate()) : undefined,
                                    origin: x,
                                    color: 'rgb(23, 162, 151)'
                                }
                                return formattedData;
                            })
                            let oldestDateArray = this.workflowsData.reduce((r, o) => o.origin?.lastClientPeriodEndDate > r.origin?.lastClientPeriodEndDate ? o : r);
                            this.ganttWorkflows.viewOptions.start = new GanttDate(getUnixTime(new Date(this.formatDate(date))));
                            this.ganttWorkflows.viewOptions.min = new GanttDate(getUnixTime(new Date(this.formatDate(date))));
                            this.ganttWorkflows.viewOptions.end = new GanttDate(getUnixTime(new Date(this.formatDate(oldestDateArray.origin.lastClientPeriodEndDate))));
                            this.ganttWorkflows.viewOptions.max = new GanttDate(getUnixTime(new Date(this.formatDate(oldestDateArray.origin.lastClientPeriodEndDate))));
                            this.ganttWorkflows.viewChange.emit();
                        }
                        this.totalCount = result.totalCount;
                    });
                break;
            case 2: //'Consultant periods':
                this._mainOverviewService.consultants(
                    mainOverviewStatus?.id,
                    ownerIds,
                    invoicingEntity,
                    paymentEntity,
                    salesType,
                    deliveryType,
                    margins,
                    searchFilter,
                    this.cutOffDate,
                    this.pageNumber,
                    this.deafultPageSize,
                    this.sorting)
                    .pipe(finalize(() => {
                        this.isDataLoading = false;
                        this.hideMainSpinner();
                    }))
                    .subscribe(result => {
                        if (result.items?.length) {
                            this.consultantsData = result.items!.map(x => {
                                let formattedData: GanttItem<MainOverviewItemForConsultantDto>;
                                formattedData = {
                                    id: x.workflowId!,
                                    title: x.clientDisplayName!,
                                    start: getUnixTime(x.consultantPeriods![0]?.startDate!.toDate()),
                                    end: x.consultantPeriods![0]?.endDate ? getUnixTime(x.consultantPeriods![0]?.endDate!.toDate()) : undefined,
                                    origin: x,
                                    color: 'rgb(250, 173, 25)'
                                }
                                return formattedData;
                            })
                            let oldestDateArray = this.consultantsData.reduce((r, o) => o.origin?.lastConsultantPeriodEndDate > r.origin?.lastConsultantPeriodEndDate ? o : r);
                            this.ganttConsultants.viewOptions.start = new GanttDate(getUnixTime(new Date(this.formatDate(date))));
                            this.ganttConsultants.viewOptions.min = new GanttDate(getUnixTime(new Date(this.formatDate(date))));
                            this.ganttConsultants.viewOptions.end = new GanttDate(getUnixTime(new Date(this.formatDate(oldestDateArray.origin.lastConsultantPeriodEndDate))));
                            this.ganttConsultants.viewOptions.max = new GanttDate(getUnixTime(new Date(this.formatDate(oldestDateArray.origin.lastConsultantPeriodEndDate))));
                            this.ganttConsultants.viewChange.emit();
                        }
                        this.totalCount = result.totalCount;
                    });
                break
        }
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
        this.changeViewType();
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

    getDeliveryTypes() {
        this._internalLookupService.getDeliveryTypes()
            .pipe(finalize(() => {

            }))
            .subscribe(result => {
                this.deliveryTypes = result;
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
            this.userSelectedStatuses = result.filter(x => x.canBeSetByUser);
        })
    }

    changeOverviewStatus(status: SelectableStatusesDto) {
        this.filteredMainOverviewStatuses.forEach(x => {
            if (x.id !== status.id) {
                x.selected = false;
            }
        })
        status.selected = !status.selected;
        this.changeViewType();
    }

    statusesTrackBy(index: number, item: SelectableStatusesDto) {
        return item.id;
    }

    getCurrentUser() {
        this.selectedAccountManagers = [];

        this._employeeService.current()
            .pipe(finalize(()=> {
                this.changeViewType();
            }))
            .subscribe(result => {
                this.selectedAccountManagers.push(
                    new SelectableEmployeeDto({
                        id: result.id!,
                        name: result.name!,
                        externalId: result.externalId!,
                        selected: true
                    })
                );
            });
    }

    getOverviewViewTypes() {
        this._mainOverviewService.viewTypes().subscribe(result => {
            this.overviewViewTypes = result;
        });
    }

    setUserSelectedStatusForWorflow(workflowId: string, userSelectedStatus: number) {
        this.showMainSpinner();
        this._mainOverviewService.setUserSelectedStatusForWorkflow(workflowId, userSelectedStatus)
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(result => {
                this.changeViewType();
            })
    }
    setUserSelectedStatusForConsultant(workflowId: string, consultantId: number, userSelectedStatus: number) {
        this.showMainSpinner();
        this._mainOverviewService.setUserSelectedStatusForConsultant(workflowId, consultantId, userSelectedStatus)
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(result => {
                this.changeViewType();
            })
    }

    redirectToWorkflow(id: string) {
        this.router.navigate(['app/workflow', id]);
    }

    workflowsPageChanged(event?: any): void {
        this.pageNumber = event.pageIndex + 1;
        this.deafultPageSize = event.pageSize;
        this.changeViewType();
    }

    consultantsPageChanged(event?: any): void {
        this.pageNumber = event.pageIndex + 1;
        this.deafultPageSize = event.pageSize;
        this.changeViewType();
    }

    clearAllFilters() {
        this.workflowFilter.setValue(null, {emitEvent: false});
        // this.accountManagerFilter.setValue(null, {emitEvent: false});
        this.invoicingEntityControl.setValue(null, {emitEvent: false});
        this.paymentEntityControl.setValue(null, {emitEvent: false});
        this.salesTypeControl.setValue(null, {emitEvent: false});
        this.deliveryTypesControl.setValue(null, {emitEvent: false});
        this.marginsControl.setValue(null, {emitEvent: false});
        this.filteredMainOverviewStatuses.forEach(x => {
            x.selected = false;
        })
        this.getCurrentUser();
    }
}
