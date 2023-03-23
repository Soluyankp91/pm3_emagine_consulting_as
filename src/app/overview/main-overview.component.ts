import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { GanttDate, GanttGroup, GanttItem, GanttViewType, NgxGanttComponent } from '@worktile/gantt';
import { getUnixTime } from 'date-fns';
import { merge, Subject, Subscription } from 'rxjs';
import { debounceTime, finalize, switchMap, takeUntil, map } from 'rxjs/operators';
import { AppConsts } from 'src/shared/AppConsts';
import {
	EmployeeDto,
	EmployeeServiceProxy,
	EnumEntityTypeDto,
	LookupServiceProxy,
	MainOverviewItemPeriodDto,
	MainOverviewServiceProxy,
	MainOverviewStatus,
	MainOverviewStatusDto,
} from 'src/shared/service-proxies/service-proxies';
import { SelectableIdNameDto } from '../client/client.model';
import { InternalLookupService } from '../shared/common/internal-lookup.service';
import { ManagerStatus } from '../shared/components/manager-search/manager-search.model';
import { OverviewFilterColors, OverviewFlag, OverviewProcessColors, SelectableCountry, SelectableEmployeeDto, SelectableStatusesDto } from './main-overview.model';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { AppComponentBase } from 'src/shared/app-component-base';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MapTenantCountryCode } from 'src/shared/helpers/tenantHelper';
import { ERouteTitleType } from 'src/shared/AppEnums';
import { TitleService } from 'src/shared/common/services/title.service';

const MainOverviewGridOptionsKey = 'MainOverviewGridFILTERS.1.0.3';

@Component({
	selector: 'app-main-overview',
	templateUrl: './main-overview.component.html',
	styleUrls: ['./main-overview.component.scss'],
})
export class MainOverviewComponent extends AppComponentBase implements OnInit {
	@ViewChild('ganttWorkflows', { static: false }) ganttWorkflows: NgxGanttComponent;
	@ViewChild('ganttConsultants', { static: false }) ganttConsultants: NgxGanttComponent;
	@ViewChild('trigger', { read: MatAutocompleteTrigger }) trigger: MatAutocompleteTrigger;
	isLoading: boolean;
	isCountriesLoading: boolean;

	selectedAccountManagers: SelectableEmployeeDto[] = [];
	filteredAccountManagers: SelectableEmployeeDto[] = [];

	workflowsPageNumber = 1;
	consultantsPageNumber = 1;

	workflowsDeafultPageSize = AppConsts.grid.defaultPageSize;
	consultantsDeafultPageSize = AppConsts.grid.defaultPageSize;

	pageSizeOptions = [5, 10, 20, 50, 100];
	workflowsTotalCount: number | undefined = 0;
	consultantsTotalCount: number | undefined = 0;

	workflowSorting = '';
	consultantSorting = '';
	isDataLoading = true;

	legalEntities: SelectableCountry[] = [];

	saleTypes: EnumEntityTypeDto[] = [];
	deliveryTypes: EnumEntityTypeDto[] = [];
	margins: EnumEntityTypeDto[] = [];
	isAdvancedFilters = false;
	advancedFiltersCounter = 0;
    overviewFilterColors = OverviewFilterColors;
    overviewProcessColors = OverviewProcessColors;

	workflowFilter = new UntypedFormControl(null);
	accountManagerFilter = new UntypedFormControl();
	invoicingEntityControl = new UntypedFormControl();
	paymentEntityControl = new UntypedFormControl();
	salesTypeControl = new UntypedFormControl();
	deliveryTypesControl = new UntypedFormControl();
	marginsControl = new UntypedFormControl();
	overviewViewTypeControl = new UntypedFormControl(1);

	managerStatus = ManagerStatus;
	mainOverviewStatuses: MainOverviewStatusDto;
	filteredMainOverviewStatuses: SelectableStatusesDto[] = [];
	overviewViewTypes: { [key: string]: string };
	cutOffDate = moment();
	userSelectedStatuses: MainOverviewStatusDto[] = [];
	isInitial = true;

	workflowsData: any[] = [];
	consultantsData: any[] = [];
	workflowItems: GanttItem[] = [];
	workflowGroups: GanttGroup<any>[] = [];
	consultantsItems: GanttItem[] = [];
	consultantsGroups: GanttGroup<any>[] = [];

	viewType: UntypedFormControl = new UntypedFormControl(GanttViewType.week);

	startDate = new Date();
	startDateOfChart: number;
	viewOptions = {
		mergeIntervalDays: 3,
		dateFormat: {
			yearQuarter: `QQQ 'of' yyyy`,
			month: 'LLL yy',
			week: 'w',
			year: 'yyyy',
		},
		cellWidth: 75,
		start: new GanttDate(getUnixTime(new Date(this.startDate.setDate(this.startDate.getDate() - 7)))),
		end: new GanttDate(),
		min: new GanttDate(),
		max: new GanttDate(),
	};

	views = [
		{
			name: 'Week view',
			value: GanttViewType.week,
		},
		{
			name: 'Month view',
			value: GanttViewType.month,
		},
	];

	workflowChartSubscription: Subscription;
	consultantChartSubscription: Subscription;

	private _unsubscribe = new Subject();

	constructor(
		injector: Injector,
		private _lookupService: LookupServiceProxy,
		private _internalLookupService: InternalLookupService,
		private _mainOverviewService: MainOverviewServiceProxy,
		private router: Router,
		private _employeeService: EmployeeServiceProxy,
        private _titleService: TitleService,
	) {
		super(injector);
		this.accountManagerFilter.valueChanges
			.pipe(
				takeUntil(this._unsubscribe),
				debounceTime(300),
				switchMap((value: any) => {
					let toSend = {
						name: value ? value : '',
						maxRecordsCount: 1000,
						showAll: true,
						excludeIds: this.selectedAccountManagers.map((x) => +x.id),
					};
					if (value?.id) {
						toSend.name = value.id ? value.name : value;
					}
					this.isLoading = true;
					return this._lookupService.employees(toSend.name, toSend.showAll, toSend.excludeIds);
				})
			)
			.subscribe((list: EmployeeDto[]) => {
				if (list.length) {
					this.filteredAccountManagers = list.map((x) => {
						return new SelectableEmployeeDto({
							id: x.id!,
							name: x.name!,
							externalId: x.externalId!,
							selected: false,
						});
					});
				} else {
					this.filteredAccountManagers = [
						{ name: 'No managers found', externalId: '', id: 'no-data', selected: false },
					];
				}
				this.isLoading = false;
			});

		merge(
			this.invoicingEntityControl.valueChanges,
			this.paymentEntityControl.valueChanges,
			this.salesTypeControl.valueChanges,
			this.deliveryTypesControl.valueChanges,
			this.marginsControl.valueChanges,
			this.overviewViewTypeControl.valueChanges,
			this.workflowFilter.valueChanges
		)
			.pipe(takeUntil(this._unsubscribe), debounceTime(700))
			.subscribe(() => {
				this.updateAdvancedFiltersCounter();
				this.changeViewType(true);
			});
	}

	ngOnInit(): void {
        this._titleService.setTitle(ERouteTitleType.Overview);
		this.getLegalEntities();
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

	updateAdvancedFiltersCounter() {
		let filtersArr = new Array(
			this.paymentEntityControl.value?.length,
			this.salesTypeControl.value?.length,
			this.deliveryTypesControl.value?.length,
			this.marginsControl.value?.length
		).filter((item) => item !== null && item !== undefined);
		this.advancedFiltersCounter = filtersArr.length > 0 ? filtersArr.reduce((prev, curr) => prev + curr) : 0;
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

	changeViewType(filterChanged?: boolean) {
		let cutOffDate = new Date();
		switch (this.viewType.value) {
			case GanttViewType.week:
				this.viewOptions.cellWidth = 50;
				this.getMainOverview(cutOffDate, filterChanged);
				break;
			case GanttViewType.month:
				this.viewOptions.cellWidth = 75;
				this.getMainOverview(cutOffDate, filterChanged);
				break;
		}
	}

	formatDate(date: any) {
		var d = new Date(date),
			month = d.getMonth() + 2,
			day = d.getDate() - d.getDate(),
			year = d.getFullYear() + 1;

		return new Date(year, month, day);
	}

	formatItems(length: number, parent: MainOverviewItemPeriodDto[], group: string, workflowStatus: MainOverviewStatus, actualEndDate: moment.Moment) {
		const items = [];
		for (let i = 0; i < length; i++) {
            if (workflowStatus === MainOverviewStatus.Terminated) {
                parent![i].endDate = actualEndDate;
            }
			items.push({
				id: `${parent![i]?.id || group}`,
				title: `${parent![i]?.periodType}`,
				start: getUnixTime(parent![i]?.startDate?.toDate()!),
				end:
					parent![i]?.endDate !== undefined
						? getUnixTime(parent![i]?.endDate!.toDate()!)
						: getUnixTime(this.viewOptions.end!.value),
				group_id: group,
				color: this.getColorForPeriod(parent!, workflowStatus, i),
				origin: parent[i],
			});
		}
		return items;
	}

	getColorForPeriod(parent: MainOverviewItemPeriodDto[], workflowStatus: MainOverviewStatus, index: number) {
		if (parent.length > 1) {
			if (parent.length - 1 === index) {
				// the last period
				return this.detectColorBasedOnStatus(workflowStatus);
			} else {
				return 'rgb(23, 162, 151)';
			}
		} else {
			return this.detectColorBasedOnStatus(workflowStatus);
		}
	}

	detectColorBasedOnStatus(workflowStatus: MainOverviewStatus) {
		switch (workflowStatus) {
			case MainOverviewStatus.ExpectedExtension:
			case MainOverviewStatus.InNegotiation:
			case MainOverviewStatus.ExpectedToTerminate:
			case MainOverviewStatus.AttentionRequired:
				return 'rgb(250, 173, 25)';
			default:
				return 'rgb(23, 162, 151)';
		}
	}

	getMainOverview(date?: any, filterChanged?: boolean) {
		let showDeleted = false; // hardcoded as Mandy told that there is no business need in this feature
		this.isDataLoading = true;
		let searchFilter = this.workflowFilter.value ? this.workflowFilter.value : '';
		let ownerIds = this.selectedAccountManagers.map((x) => +x.id);
		let invoicingEntity = this.invoicingEntityControl.value?.id ?? undefined;
		let paymentEntity = this.paymentEntityControl.value ?? undefined;
		let salesType = this.salesTypeControl.value ?? undefined;
		let deliveryType = this.deliveryTypesControl.value ?? undefined;
		let margins = this.marginsControl.value ?? undefined;
		let mainOverviewStatuses = this.filteredMainOverviewStatuses.filter((x) => x.selected).map((x) => x.id);
		if (date) {
			this.cutOffDate = date;
		}
		this.workflowGroups = [];
		this.workflowItems = [];
		this.consultantsGroups = [];
		this.consultantsItems = [];
		switch (this.overviewViewTypeControl.value) {
			case 1: // 'Client periods':
				if (this.workflowChartSubscription) {
					this.workflowChartSubscription.unsubscribe();
				}
				if (filterChanged) {
					this.workflowsPageNumber = 1;
				}
				this.workflowChartSubscription = this._mainOverviewService
					.workflows(
						mainOverviewStatuses,
						ownerIds,
						invoicingEntity,
						paymentEntity,
						salesType,
						deliveryType,
						margins,
						searchFilter,
						this.cutOffDate,
						showDeleted,
						this.workflowsPageNumber,
						this.workflowsDeafultPageSize,
						this.workflowSorting
					)
					.pipe(
						finalize(() => {
							this.isDataLoading = false;
							this.hideMainSpinner();
						})
					)
					.subscribe((result) => {
						if (result.items?.length) {
							let oldestDateArray = result.items.reduce((r, o) => (o.actualEndDate! > r.actualEndDate! ? o : r));

							let endDate = new Date();
							if (
								oldestDateArray.actualEndDate === undefined ||
								oldestDateArray.actualEndDate.toDate().getTime() < this.formatDate(date).getTime()
							) {
								endDate = this.formatDate(date);
							}

							this.startDateOfChart = getUnixTime(date);
							this.viewOptions.start = new GanttDate(getUnixTime(date));
							this.viewOptions.end =
								new Date(endDate.setHours(0, 0, 0, 0)).getTime() !==
								new Date(new Date().setHours(0, 0, 0, 0)).getTime()
									? new GanttDate(getUnixTime(endDate))
									: new GanttDate(getUnixTime(new Date(oldestDateArray.actualEndDate?.toDate()!)));
							this.viewOptions.min = new GanttDate(getUnixTime(date));
							this.viewOptions.max =
								new Date(endDate.setHours(0, 0, 0, 0)).getTime() !==
								new Date(new Date().setHours(0, 0, 0, 0)).getTime()
									? new GanttDate(getUnixTime(endDate))
									: new GanttDate(getUnixTime(new Date(oldestDateArray.actualEndDate?.toDate()!)));

							let groups: GanttGroup<any>[] = [];
							let items: GanttItem[] = [];

							result.items!.map((x, index) => {
								groups.push({
									id: x.workflowId!,
									title: x.clientDisplayName!,
									origin: x!,
								});

								items = [
									...items,
									...this.formatItems(
										x.clientPeriods?.length!,
										x.clientPeriods!,
										groups[index].id,
										x.mainOverviewStatusOfWorkflowForSales!,
                                        x.actualEndDate
									),
								];
							});

							this.workflowGroups = groups;
							this.workflowItems = items;
						}

						this.workflowsTotalCount = result.totalCount;
						this.saveGridOptions();
					});
				break;
			case 2: //'Consultant periods':
				if (this.consultantChartSubscription) {
					this.consultantChartSubscription.unsubscribe();
				}

				if (filterChanged) {
					this.consultantsPageNumber = 1;
				}
				this.consultantChartSubscription = this._mainOverviewService
					.consultants(
						mainOverviewStatuses,
						ownerIds,
						invoicingEntity,
						paymentEntity,
						salesType,
						deliveryType,
						margins,
						searchFilter,
						this.cutOffDate,
						showDeleted,
						this.consultantsPageNumber,
						this.consultantsDeafultPageSize,
						this.consultantSorting
					)
					.pipe(
						finalize(() => {
							this.isDataLoading = false;
							this.hideMainSpinner();
						})
					)
					.subscribe((result) => {
						if (result.items?.length) {
							let oldestDateArray = result.items.reduce((r, o) => (o?.actualEndDate! > r?.actualEndDate! ? o : r));

							let endDate = new Date();
							if (
								oldestDateArray.actualEndDate === undefined ||
								oldestDateArray.actualEndDate.toDate().getTime() < this.formatDate(date).getTime()
							) {
								endDate = this.formatDate(date);
							}

							this.startDateOfChart = getUnixTime(date);
							this.viewOptions.start = new GanttDate(getUnixTime(new Date(date)));
							this.viewOptions.end =
								endDate.getTime() !== new Date().getTime()
									? new GanttDate(getUnixTime(endDate))
									: new GanttDate(getUnixTime(new Date(oldestDateArray.actualEndDate?.toDate()!)));
							this.viewOptions.min = new GanttDate(getUnixTime(new Date(date)));
							this.viewOptions.max =
								endDate.getTime() !== new Date().getTime()
									? new GanttDate(getUnixTime(endDate))
									: new GanttDate(getUnixTime(new Date(oldestDateArray.actualEndDate?.toDate()!)));

							let groups: GanttGroup<any>[] = [];
							let items: GanttItem[] = [];

							result.items!.map((x, index) => {
								groups.push({
									id: x.workflowId!,
									title: x.clientDisplayName!,
									origin: x!,
								});

								items = [
									...items,
									...this.formatItems(
										x.consultantPeriods?.length!,
										x.consultantPeriods!,
										groups[index].id,
										x.mainOverviewStatusOfWorkflowConsultantForSales!,
                                        x.actualEndDate
									),
								];
							});

							this.consultantsGroups = groups;
							this.consultantsItems = items;
						}
						this.consultantsTotalCount = result.totalCount;
						this.saveGridOptions();
					});
				break;
		}
	}

	optionClicked(
		event: Event,
		item: SelectableIdNameDto | SelectableCountry | SelectableEmployeeDto,
		list: SelectableIdNameDto[] | SelectableCountry[] | SelectableEmployeeDto[]
	) {
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
		this.changeViewType(true);
	}

	getLegalEntities() {
		this.isCountriesLoading = true;
		this._internalLookupService
			.getLegalEntities()
			.pipe(
				finalize(() => (this.isCountriesLoading = false)),
				map((entities) =>
					entities.map((x) => {
						return new SelectableCountry({
							id: x.id!,
							name: x.name!,
							tenantName: x.tenantName!,
							code: MapTenantCountryCode(x.tenantName!)!,
							selected: false,
							flag: x.tenantName!,
						});
					})
				)
			)
			.subscribe((result) => {
				this.legalEntities = result;
			});
	}

	getSalesType() {
		this._internalLookupService
			.getSaleTypes()
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.saleTypes = result;
			});
	}

	getDeliveryTypes() {
		this._internalLookupService
			.getDeliveryTypes()
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.deliveryTypes = result;
			});
	}

	getMargins() {
		this._internalLookupService
			.getMargins()
			.pipe(finalize(() => {}))
			.subscribe((result) => {
				this.margins = result;
			});
	}

	getMainOverviewStatuses() {
		this._mainOverviewService.statuses().subscribe((result) => {
			this.userSelectedStatuses = result.filter((x) => x.canBeSetByUser);
			this.filteredMainOverviewStatuses = result.map((x) => {
				return new SelectableStatusesDto({
					id: x.id!,
					name: x.name!,
					canBeSetAutomatically: x.canBeSetAutomatically!,
					canBeSetByUser: x.canBeSetByUser!,
					selected: false,
					flag: this.detectIcon(x.id!),
					color: this.detectProcessColor(x.id!),
				});
			});
		});
	}

	changeOverviewStatus(status: SelectableStatusesDto) {
		status.selected = !status.selected;
		this.changeViewType(true);
	}

	statusesTrackBy(index: number, item: SelectableStatusesDto) {
		return item.id;
	}

	getCurrentUser() {
		this.selectedAccountManagers = [];

		this._employeeService
			.current()
			.pipe(
				finalize(() => {
					this.getGridOptions();
				})
			)
			.subscribe((result) => {
				this.selectedAccountManagers.push(
					new SelectableEmployeeDto({
						id: result.id!,
						name: result.name!,
						externalId: result.externalId!,
						selected: true,
					})
				);
			});
	}

	getOverviewViewTypes() {
		this._mainOverviewService.viewTypes().subscribe((result) => {
			this.overviewViewTypes = result;
		});
	}

	setUserSelectedStatusForWorflow(event: any) {
		this.isDataLoading = true;
		this._mainOverviewService
			.setUserSelectedStatusForWorkflow(event.workflowId, event.userSelectedStatus)
			.pipe(
				finalize(() => {
					this.isDataLoading = false;
				})
			)
			.subscribe(() => {
				this.changeViewType();
			});
	}
	setUserSelectedStatusForConsultant(event: any) {
		this.isDataLoading = true;
		this._mainOverviewService
			.setUserSelectedStatusForConsultant(event.workflowId, event.consultantId, event.userSelectedStatus)
			.pipe(
				finalize(() => {
					this.isDataLoading = false;
				})
			)
			.subscribe(() => {
				this.changeViewType();
			});
	}

	redirectToWorkflow(id: string) {
		this.router.navigate(['app/workflow', id]);
	}

	workflowsPageChanged(event?: any): void {
		this.workflowsPageNumber = event.pageIndex + 1;
		this.workflowsDeafultPageSize = event.pageSize;
		this.changeViewType();
	}

	workflowSortChanged(sort: string) {
		this.workflowSorting = sort;
		this.changeViewType();
	}

	consultantsPageChanged(event?: any): void {
		this.consultantsPageNumber = event.pageIndex + 1;
		this.consultantsDeafultPageSize = event.pageSize;
		this.changeViewType();
	}

	consultantSortChanged(sort: string) {
		this.consultantSorting = sort;
		this.changeViewType();
	}

	clearAllFilters() {
		this.workflowFilter.setValue(null, { emitEvent: false });
		this.invoicingEntityControl.setValue(null, { emitEvent: false });
		this.paymentEntityControl.setValue(null, { emitEvent: false });
		this.salesTypeControl.setValue(null, { emitEvent: false });
		this.deliveryTypesControl.setValue(null, { emitEvent: false });
		this.marginsControl.setValue(null, { emitEvent: false });
		this.filteredMainOverviewStatuses.forEach((x) => {
			x.selected = false;
		});
		localStorage.removeItem(MainOverviewGridOptionsKey);
		this.getCurrentUser();
	}

	saveGridOptions() {
		let filters = {
			workflowsPageNumber: this.workflowsPageNumber,
			consultantsPageNumber: this.consultantsPageNumber,
			workflowsDeafultPageSize: this.workflowsDeafultPageSize,
			consultantsDeafultPageSize: this.consultantsDeafultPageSize,
			workflowSorting: this.workflowSorting,
			consultantSorting: this.consultantSorting,
			owners: this.selectedAccountManagers,
			invoicingEntity: this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined,
			paymentEntity: this.paymentEntityControl.value ? this.paymentEntityControl.value : undefined,
			salesType: this.salesTypeControl.value ? this.salesTypeControl.value : undefined,
			deliveryTypes: this.deliveryTypesControl.value ? this.deliveryTypesControl.value : undefined,
			searchFilter: this.workflowFilter.value ? this.workflowFilter.value : '',
			margins: this.marginsControl.value ?? undefined,
			mainOverviewStatus: this.filteredMainOverviewStatuses.filter((x) => x.selected),
			cutOffDate: this.cutOffDate,
			overviewViewTypeControl: this.overviewViewTypeControl.value,
			viewType: this.viewType.value,
		};

		localStorage.setItem(MainOverviewGridOptionsKey, JSON.stringify(filters));
	}

	getGridOptions() {
		let filters = JSON.parse(localStorage.getItem(MainOverviewGridOptionsKey)!);
		if (filters) {
			this.workflowsPageNumber = filters?.workflowsPageNumber;
			this.workflowsDeafultPageSize = filters?.workflowsDeafultPageSize;
			this.consultantsPageNumber = filters?.consultantsPageNumber;
			this.consultantsDeafultPageSize = filters?.consultantsDeafultPageSize;
			this.workflowSorting = filters?.workflowSorting;
			this.consultantSorting = filters?.consultantSorting;
			this.selectedAccountManagers = filters?.owners?.length ? filters.owners : [];
			this.deliveryTypesControl.setValue(filters?.deliveryTypes, { emitEvent: false });
			this.salesTypeControl.setValue(filters?.salesType, { emitEvent: false });
			this.paymentEntityControl.setValue(filters?.paymentEntity, { emitEvent: false });
			this.invoicingEntityControl.setValue(filters?.invoicingEntity, { emitEvent: false });
			this.workflowFilter.setValue(filters?.searchFilter, { emitEvent: false });
			this.marginsControl.setValue(filters?.margins, { emitEvent: false });
			if (filters?.mainOverviewStatus?.length) {
				filters.mainOverviewStatus.forEach((status: SelectableStatusesDto) => {
					const index = this.filteredMainOverviewStatuses.findIndex((x) => x.id === status?.id);
					if (index > -1) {
						this.filteredMainOverviewStatuses[index].selected = true;
					}
				});
			}
			this.cutOffDate = filters?.cutOffDate;
			this.overviewViewTypeControl.setValue(filters?.overviewViewTypeControl, { emitEvent: false });
			this.viewType.setValue(filters?.viewType, { emitEvent: false });
		}
		this.updateAdvancedFiltersCounter();
		this.changeViewType();
	}

	openMenu(event: any) {
		event.stopPropagation();
		this.trigger.openPanel();
	}

	onOpenedMenu() {
		this.accountManagerFilter.setValue('');
		this.accountManagerFilter.markAsTouched();
	}

	compareWithFn(listOfItems: any, selectedItem: any) {
		return listOfItems && selectedItem && listOfItems.id === selectedItem.id;
	}

	displayNameFn(option: any) {
		return option?.name;
	}

	resetInvoicingEntity() {
		this.invoicingEntityControl.setValue(null);
	}
}
