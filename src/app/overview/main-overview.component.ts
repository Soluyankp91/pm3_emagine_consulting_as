import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GanttDate, GanttGroup, GanttItem, GanttViewOptions, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import { Subject } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import { ApiServiceProxy, EmployeeDto, EmployeeServiceProxy, EnumEntityTypeDto, LookupServiceProxy, MainOverviewItemForConsultantDto, MainOverviewItemForWorkflowDto, MainOverviewItemPeriodDto, MainOverviewServiceProxy, MainOverviewStatusDto } from 'src/shared/service-proxies/service-proxies';
import { SelectableCountry, SelectableIdNameDto } from '../client/client.model';
import { InternalLookupService } from '../shared/common/internal-lookup.service';
import { ManagerStatus } from '../shared/components/manager-search/manager-search.model';
import { OverviewFlag, SelectableEmployeeDto, SelectableStatusesDto } from './main-overview.model';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { AppComponentBase } from 'src/shared/app-component-base';

const MainOverviewGridOptionsKey = 'MainOverviewGridFILTERS.1.0.0.';

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
    isDataLoading = true;

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

    isInitial = true;

    workflowsData: any[] = [];
    consultantsData: any[] = [];
    workflowItems: GanttItem[] = [];
    workflowGroups: GanttGroup<any>[] = [];
    consultantsItems: GanttItem[] = [];
    consultantsGroups: GanttGroup<any>[] = [];

    viewType: FormControl = new FormControl(GanttViewType.week);

    startDate = new Date();
    viewOptions = {
        mergeIntervalDays: 3,
        dateFormat: {
            yearQuarter: `QQQ 'of' yyyy`,
            month: 'LLL yy',
            week: 'w',
            year: 'yyyy'
        },
        cellWidth: 75,
        start: new GanttDate(getUnixTime(new Date(this.startDate.setDate(this.startDate.getDate() - 7)))),
        end: new GanttDate(),
        min: new GanttDate(),
        max: new GanttDate()
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
            debounceTime(700)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.paymentEntityControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(700)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.salesTypeControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(700)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.deliveryTypesControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(700)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.marginsControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(700)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.overviewViewTypeControl.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(700)
        ).subscribe(() => {
            this.changeViewType();
        });

        this.workflowFilter.valueChanges.pipe(
            takeUntil(this._unsubscribe),
            debounceTime(700)
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
            case GanttViewType.week:
                let cutOffDateWeek = new Date();
                cutOffDateWeek.setDate(cutOffDateWeek.getDate() - 7);
                this.viewOptions.cellWidth = 50;
                this.getMainOverview(cutOffDateWeek);
                break;
            case GanttViewType.month:
                let cutOffDateMonth = new Date();
                // cutOffDateMonth.setMonth(cutOffDateMonth.getMonth() - 1);
                cutOffDateMonth.setDate(cutOffDateMonth.getDate() - 7);

                this.viewOptions.cellWidth = 75;
                this.getMainOverview(cutOffDateMonth);
                break;
        }
    }

    formatDate(date: any) {
        var d = new Date(date),
            month = (d.getMonth() + 2),
            day = d.getDate() - d.getDate(),
            year = d.getFullYear() + 1;

        return new Date(year, month, day);
    }

    mapListByProperty(list: any[], prop: string) {
        if (list?.length) {
            return list.map(x =>  x[prop]).join(', ');
        } else {
            return '-';
        }
    }

    formatItems(length: number, parent?: MainOverviewItemPeriodDto[], group?: string) {
        const items = [];
        for (let i = 0; i < length; i++) {
            items.push({
                id: `${parent![i]?.id || group}`,
                title: `${parent![i]?.periodType}`,
                start: getUnixTime(parent![i]?.startDate?.toDate()!),
                end: parent![i]?.endDate !== undefined ? getUnixTime(parent![i]?.endDate!.toDate()!) : getUnixTime(this.viewOptions.end!.value),
                group_id: group,
                color: parent![i]?.periodType === 'Extend period' ? 'rgb(23, 162, 151)' : 'rgb(250, 173, 25)'
            });
        }
        return items;
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
            this.cutOffDate = date;
        }
        // this.workflowsData = [];
        // this.consultantsData = [];
        this.workflowGroups = [];
        this.workflowItems = [];
        this.consultantsGroups = [];
        this.consultantsItems = [];
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
                            let oldestDateArray = result.items.reduce((r, o) => o.lastClientPeriodEndDate! > r.lastClientPeriodEndDate! ? o : r);

                            let endDate = new Date();
                            if (oldestDateArray.lastClientPeriodEndDate === undefined || (oldestDateArray.lastClientPeriodEndDate.toDate().getTime() < this.formatDate(date).getTime())) {
                                endDate = this.formatDate(date);
                            }
                            // console.log(new Date(endDate.setHours(0,0,0,0)).getTime() !== new Date(new Date().setHours(0,0,0,0)).getTime());
                            // this.viewOptions = {
                                // mergeIntervalDays: 3,
                                // cellWidth: 50,
                                // dateFormat: {
                                //     yearQuarter: `QQQ 'of' yyyy`,
                                //     month: 'LLL yy',
                                //     week: 'w',
                                //     year: 'yyyy'
                                // },
                            this.viewOptions.start = new GanttDate(getUnixTime(date)),
                            this.viewOptions.end = new Date(endDate.setHours(0,0,0,0)).getTime() !== new Date(new Date().setHours(0,0,0,0)).getTime() ? new GanttDate(getUnixTime(endDate)) : new GanttDate(getUnixTime(new Date(oldestDateArray.lastClientPeriodEndDate?.toDate()!))),
                            this.viewOptions.min = new GanttDate(getUnixTime(date)),
                            this.viewOptions.max = new Date(endDate.setHours(0,0,0,0)).getTime() !== new Date(new Date().setHours(0,0,0,0)).getTime() ? new GanttDate(getUnixTime(endDate)) : new GanttDate(getUnixTime(new Date(oldestDateArray.lastClientPeriodEndDate?.toDate()!)))
                            // }

                            // this.workflowsData = result.items!.map(x => {
                            //     let formattedData: GanttItem<MainOverviewItemForWorkflowDto>;
                            //     formattedData = {
                            //         id: x.workflowId!,
                            //         title: x.clientDisplayName!,
                            //         start: getUnixTime(x.clientPeriods![0]?.startDate!.toDate()),
                            //         end: x.clientPeriods![0]?.endDate ? getUnixTime(x.clientPeriods![0]?.endDate!.toDate()) : getUnixTime(this.viewOptions.end!.value),
                            //         origin: x,
                            //         color: 'rgb(23, 162, 151)'
                            //     }
                            //     return formattedData;
                            // });

                            let groups: GanttGroup<any>[] = [];
                            let items: GanttItem[] = [];

                            result.items!.map((x, index) => {
                                groups.push({
                                    id: x.workflowId!,
                                    title: x.clientDisplayName!,
                                    origin: x!
                                })

                                items = [...items, ...this.formatItems(x.clientPeriods?.length!, x.clientPeriods, groups[index].id)];
                            });

                            this.workflowGroups = groups;
                            this.workflowItems = items;

                            // this.ganttWorkflows.viewOptions.start = new GanttDate(getUnixTime(date));
                            // this.ganttWorkflows.viewOptions.min = new GanttDate(getUnixTime(date));
                            // this.ganttWorkflows.viewOptions.end = new GanttDate(getUnixTime(new Date(oldestDateArray.lastClientPeriodEndDate?.toDate()!)));
                            // this.ganttWorkflows.viewOptions.max = new GanttDate(getUnixTime(new Date(oldestDateArray.lastClientPeriodEndDate?.toDate()!)));

                            // this.ganttWorkflows.view.options.start = new GanttDate(getUnixTime(date));
                            // this.ganttWorkflows.view.options.min = new GanttDate(getUnixTime(date));
                            // this.ganttWorkflows.view.options.max = new GanttDate(getUnixTime(new Date(oldestDateArray.lastClientPeriodEndDate?.toDate()!)));
                            // this.ganttWorkflows.view.options.end = new GanttDate(getUnixTime(new Date(oldestDateArray.lastClientPeriodEndDate?.toDate()!)));
                            // this.ganttWorkflows.view.end$.next(new GanttDate(getUnixTime(new Date(oldestDateArray.lastClientPeriodEndDate?.toDate()!))));

                            if (this.isInitial) {
                                this.viewType.setValue(GanttViewType.month);
                                this.isInitial = false;
                                this.changeViewType();
                            }
                        }

                        this.totalCount = result.totalCount;
                        this.saveGridOptions();
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
                            let oldestDateArray = result.items.reduce((r, o) => o?.lastConsultantPeriodEndDate! > r?.lastConsultantPeriodEndDate! ? o : r);

                            let endDate = new Date();
                            if (oldestDateArray.lastConsultantPeriodEndDate === undefined || oldestDateArray.lastConsultantPeriodEndDate.toDate().getTime() < this.formatDate(date).getTime()) {
                                endDate = this.formatDate(date);
                            }

                            // this.viewOptions = {
                            //     dateFormat: {
                            //         yearQuarter: `QQQ 'of' yyyy`,
                            //         month: 'LLL yy',
                            //         week: 'w',
                            //         year: 'yyyy'
                            //     },
                                this.viewOptions.start = new GanttDate(getUnixTime(new Date(date))),
                                this.viewOptions.end = endDate.getTime() !== new Date().getTime() ? new GanttDate(getUnixTime(endDate)) : new GanttDate(getUnixTime(new Date(oldestDateArray.lastConsultantPeriodEndDate?.toDate()!))),
                                this.viewOptions.min = new GanttDate(getUnixTime(new Date(date))),
                                this.viewOptions.max = endDate.getTime() !== new Date().getTime() ? new GanttDate(getUnixTime(endDate)) : new GanttDate(getUnixTime(new Date(oldestDateArray.lastConsultantPeriodEndDate?.toDate()!)))
                            // }
                            let groups: GanttGroup<any>[] = [];
                            let items: GanttItem[] = [];

                            result.items!.map((x, index) => {
                                groups.push({
                                    id: x.workflowId!,
                                    title: x.clientDisplayName!,
                                    origin: x!
                                })

                                items = [...items, ...this.formatItems(x.consultantPeriods?.length!, x.consultantPeriods, groups[index].id)];
                            });

                            this.consultantsGroups = groups;
                            this.consultantsItems = items;
                            // this.consultantsData = result.items!.map(x => {
                            //     let formattedData: GanttItem<MainOverviewItemForConsultantDto>;
                            //     formattedData = {
                            //         id: x.workflowId!,
                            //         title: x.clientDisplayName!,
                            //         start: getUnixTime(x.consultantPeriods![0]?.startDate!.toDate()),
                            //         end: x.consultantPeriods![0]?.endDate ? getUnixTime(x.consultantPeriods![0]?.endDate!.toDate()) : getUnixTime(this.viewOptions.end!.value),
                            //         origin: x,
                            //         color: 'rgb(250, 173, 25)'
                            //     }
                            //     return formattedData;
                            // })

                            // this.ganttConsultants.viewOptions.end = new GanttDate(getUnixTime(new Date(oldestDateArray.lastConsultantPeriodEndDate?.toDate()!)));
                            // this.ganttConsultants.viewOptions.min = new GanttDate(getUnixTime(new Date(date)));
                            // this.ganttConsultants.viewOptions.max = new GanttDate(getUnixTime(new Date(oldestDateArray.lastConsultantPeriodEndDate?.toDate()!)));

                            // this.ganttConsultants.view.options.min = new GanttDate(getUnixTime(new Date(date)));
                            // this.ganttConsultants.view.options.max = new GanttDate(getUnixTime(new Date(oldestDateArray.lastConsultantPeriodEndDate?.toDate()!)));
                            // this.ganttConsultants.view.options.end = new GanttDate(getUnixTime(new Date(oldestDateArray.lastConsultantPeriodEndDate?.toDate()!)));
                            // this.ganttConsultants.view.end$.next(new GanttDate(getUnixTime(new Date(oldestDateArray.lastConsultantPeriodEndDate?.toDate()!))));

                            if (this.isInitial) {
                                this.viewType.setValue(GanttViewType.month);
                                this.isInitial = false;
                                this.changeViewType();
                            }
                        }
                        this.totalCount = result.totalCount;
                        this.saveGridOptions();
                    });
                break;
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
                this.getGridOptions();
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

    setUserSelectedStatusForWorflow(event: any) {
        this.showMainSpinner();
        this._mainOverviewService.setUserSelectedStatusForWorkflow(event.workflowId, event.userSelectedStatus)
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(result => {
                this.changeViewType();
            })
    }
    setUserSelectedStatusForConsultant(event: any) {
        this.showMainSpinner();
        this._mainOverviewService.setUserSelectedStatusForConsultant(event.workflowId, event.consultantId, event.userSelectedStatus)
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
        this.invoicingEntityControl.setValue(null, {emitEvent: false});
        this.paymentEntityControl.setValue(null, {emitEvent: false});
        this.salesTypeControl.setValue(null, {emitEvent: false});
        this.deliveryTypesControl.setValue(null, {emitEvent: false});
        this.marginsControl.setValue(null, {emitEvent: false});
        this.filteredMainOverviewStatuses.forEach(x => {
            x.selected = false;
        });
        localStorage.removeItem(MainOverviewGridOptionsKey);
        this.getCurrentUser();
    }

    saveGridOptions() {
        let filters = {
            pageNumber: this.pageNumber,
            deafultPageSize: this.deafultPageSize,
            sorting: this.sorting,
            owners: this.selectedAccountManagers,
            invoicingEntity: this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined,
            paymentEntity: this.paymentEntityControl.value ? this.paymentEntityControl.value : undefined,
            salesType: this.salesTypeControl.value ? this.salesTypeControl.value : undefined,
            deliveryTypes: this.deliveryTypesControl.value ? this.deliveryTypesControl.value : undefined,
            searchFilter: this.workflowFilter.value ? this.workflowFilter.value : '',
            margins: this.marginsControl.value ?? undefined,
            mainOverviewStatus: this.filteredMainOverviewStatuses.find(x => x.selected),
            cutOffDate: this.cutOffDate
        };

        localStorage.setItem(MainOverviewGridOptionsKey, JSON.stringify(filters));
    }

    getGridOptions() {
        let filters = JSON.parse(localStorage.getItem(MainOverviewGridOptionsKey)!);
        if (filters) {
            this.pageNumber = filters?.pageNumber;
            this.deafultPageSize = filters?.deafultPageSize;
            this.sorting = filters?.sorting;
            this.selectedAccountManagers = filters?.owners?.length ? filters.owners : [];
            this.deliveryTypesControl.setValue(filters?.deliveryTypes, {emitEvent: false});
            this.salesTypeControl.setValue(filters?.salesType, {emitEvent: false});
            this.paymentEntityControl.setValue(filters?.paymentEntity, {emitEvent: false});
            this.invoicingEntityControl.setValue(filters?.invoicingEntity, {emitEvent: false});
            this.workflowFilter.setValue(filters?.searchFilter, {emitEvent: false});
            this.marginsControl.setValue(filters?.margins, {emitEvent: false});
            const index = this.filteredMainOverviewStatuses.findIndex(x => x.id === filters?.mainOverviewStatus?.id);
            if (index > -1) {
                this.filteredMainOverviewStatuses[index].selected = true;
            }
            this.cutOffDate = filters?.cutOffDate;
        }
        this.changeViewType();
    }
}
