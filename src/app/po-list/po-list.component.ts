import { SelectionModel } from '@angular/cdk/collections';
import { Component, Injector, OnDestroy, OnInit, TrackByFunction, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';
import { DISPLAYED_COLUMNS, FILTER_LABEL_MAP, PO_BOTTOM_ACTIONS, PO_CHASING_STATUSES, PO_STATUSES } from './po-list.constants';
import { TitleService } from 'src/shared/common/services/title.service';
import { ERouteTitleType } from 'src/shared/AppEnums';
import { FormControl } from '@angular/forms';
import { SelectableEmployeeDto } from '../workflow/workflow.model';
import {
    AmountWithCurrencyDto,
	ClientRateDto,
	EnumEntityTypeDto,
	LegalEntityDto,
	PurchaseOrderCapType,
	PurchaseOrderClientPeriodDto,
	PurchaseOrderQueryDto,
	PurchaseOrderQueryDtoPaginatedList,
	PurchaseOrderServiceProxy,
	PurchaseOrderSetEmagineResponsiblesCommand,
	PurchaseOrdersSetClientContactResponsibleCommand,
	PurchaseOrdersSetIsCompletedCommand,
	ValueUnitEnum,
} from 'src/shared/service-proxies/service-proxies';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {
	Actions,
	EPoBotttomActionsType,
	IGridFilters,
	IPOClientPeriodGridData,
	IPOGridData,
	IPoListPayload,
} from './po-list.model';
import { BehaviorSubject, ReplaySubject, Subject, merge } from 'rxjs';
import { AppComponentBase } from 'src/shared/app-component-base';
import { Router } from '@angular/router';
import { IDivisionsAndTeamsFilterState } from '../shared/components/teams-and-divisions/teams-and-divisions.entities';
import { DivisionsAndTeamsFilterComponent } from '../shared/components/teams-and-divisions/teams-and-divisions-filter.component';
import { EValueUnitTypes } from '../workflow/workflow-sales/workflow-sales.model';
import { BigDialogConfig, MediumDialogConfig } from 'src/shared/dialog.configs';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatDialog } from '@angular/material/dialog';
import { BulkUpdateDialogComponent } from './components/bulk-update-dialog/bulk-update-dialog.component';
import { EBulkUpdateDiallogTypes, IBulkUpdateDialogData } from './components/bulk-update-dialog/bulk-update.dialog.model';
import { AddOrEditPoDialogComponent } from '../workflow/shared/components/purchase-orders/add-or-edit-po-dialog/add-or-edit-po-dialog.component';
import { EPOChasingStatusText } from '../shared/components/po-chasing-status/po-chasing-status.model';
import { SelectableCountry } from '../overview/main-overview.model';
import { MapTenantCountryCode } from 'src/shared/helpers/tenantHelper';
import { cloneDeep } from 'lodash';

const PO_GRID_OPTIONS_KEY  = 'PurchaseOrdersGridFILTERS.1.0.0';
@Component({
	selector: 'app-po-list',
	templateUrl: './po-list.component.html',
	styleUrls: ['./po-list.component.scss'],
	animations: [
		trigger('detailExpand', [
			state('collapsed', style({ height: '0px', minHeight: '0' })),
			state('expanded', style({ height: '*' })),
			transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	],
})
export class PoListComponent extends AppComponentBase implements OnInit, OnDestroy {
	@ViewChild('treeFilter') treeFilter: DivisionsAndTeamsFilterComponent;
	selectedItemsActions: Actions[] = PO_BOTTOM_ACTIONS;
	selectionModel = new SelectionModel<IPOGridData>(true, []);
	displayedColumns = DISPLAYED_COLUMNS;
	dataSource = new MatTableDataSource<IPOGridData>();
	sortActive: string;
	sotrDirection: SortDirection;
	totalCount: number;
	pageSizeOptions = [5, 10, 20, 100];
	defaultPageSize = AppConsts.grid.defaultPageSize;
	pageNumber = 1;
	sorting = '';
    // FIXME: will be added to FromGroup in 2nd iteration
	invoicingEntityControl = new FormControl([]);
	searchFilter = new FormControl('');
	chasingStatusesFilter = new FormControl([]);
	statusesFilter = new FormControl([]);
	chasingStatuses = PO_CHASING_STATUSES;
	ePOChasingStatusText = EPOChasingStatusText;
	poStatuses = PO_STATUSES;
	selectedAccountManagers: SelectableEmployeeDto[] = [];
	includeCompleted: boolean;
	expandedElement: IPOGridData;
	ePurchaseOrderCapType = PurchaseOrderCapType;
	FILTER_LABEL_MAP = FILTER_LABEL_MAP;
	trackByAction: TrackByFunction<any>;
	gridFilters: IGridFilters = {
		noteStatusIds: [],
		chasingStatuses: [],
		clientIds: [],
		clientContactIds: [],
		consultantIds: [],
		salesTypeIds: [],
		deliveryTypeIds: [],
		capTypeIds: [],
		unitTypeId: undefined,
		clientRateIds: [],
		contractManagerIds: [],
		salesManagerIds: [],
	};

	currencies: EnumEntityTypeDto[];
	eCurrencies: { [key: number]: string };
	valueUnitTypes: EnumEntityTypeDto[];
	eValueUnitType = EValueUnitTypes;
	saleTypes: EnumEntityTypeDto[];
	deliveryTypes: EnumEntityTypeDto[];
	purchaseOrderCapTypes: { [key: string]: string };
	legalEntities: SelectableCountry[];
    rateUnitTypes: EnumEntityTypeDto[];

	teamsAndDivisionsFilterState: IDivisionsAndTeamsFilterState = {
		tenantIds: [],
		teamsIds: [],
		divisionIds: [],
	};
	selectedTeamsAndDivisionsCount: number = 0;
	isLoading$ = new BehaviorSubject(false);
	isDirty$ = new BehaviorSubject(false);
	private _unSubscribe$ = new Subject();
	constructor(
		injector: Injector,
		private readonly _titleService: TitleService,
		private readonly _purchaseOrderService: PurchaseOrderServiceProxy,
		private readonly _router: Router,
		private readonly _overlay: Overlay,
		private readonly _dialog: MatDialog
	) {
		super(injector);
	}

	ngOnInit(): void {
		this._titleService.setTitle(ERouteTitleType.POList);
		this._getEnums();
		this.getGridOptions();
        this._initPurchaseOrdersListObserver();
	}

    ngOnDestroy(): void {
        this._unSubscribe$.next();
        this._unSubscribe$.complete();
    }

	saveGridOptions(): void {
		let filters = {
			pageNumber: this.pageNumber,
			defaultPageSize: this.defaultPageSize,
			sorting: this.sorting,
			owners: this.selectedAccountManagers,
			invoicingEntity: this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined,
			chasingStatuses: this.chasingStatusesFilter.value ?? [],
			statuses: this.statusesFilter.value ?? [],
			includeCompleted: this.includeCompleted,
			searchFilter: this.searchFilter.value ? this.searchFilter.value : '',
			ownerTenantsIds: this.teamsAndDivisionsFilterState.tenantIds,
			ownerDivisionsIds: this.teamsAndDivisionsFilterState.divisionIds,
			ownerTeamsIds: this.teamsAndDivisionsFilterState.teamsIds,
		};
		this._checkIfDirty();
		localStorage.setItem(PO_GRID_OPTIONS_KEY , JSON.stringify(filters));
	}

	getGridOptions(): void {
		let filters = JSON.parse(localStorage.getItem(PO_GRID_OPTIONS_KEY )!);
		if (filters) {
			this.pageNumber = filters.pageNumber;
			this.defaultPageSize = filters.defaultPageSize;
			this.sorting = filters.sorting;
			this.selectedAccountManagers = filters.owners?.length ? filters.owners : [];
			this.invoicingEntityControl.setValue(filters.invoicingEntity ?? [], { emitEvent: false });
			this.chasingStatusesFilter.setValue(filters.chasingStatuses ?? [], { emitEvent: false });
			this.statusesFilter.setValue(filters.statuses ?? [], { emitEvent: false });
			this.includeCompleted = filters.includeCompleted;
			this.teamsAndDivisionsFilterState = {
				tenantIds: filters.ownerTenantsIds ?? [],
				divisionIds: filters.ownerDivisionsIds ?? [],
				teamsIds: filters.ownerTeamsIds ?? [],
			};
			this._teamsAndDivisionCounter(this.teamsAndDivisionsFilterState);
			this.searchFilter.setValue(filters.searchFilter, { emitEvent: false });
		}
		this.getPurchaseOrdersList();
	}

	getPurchaseOrdersList(filterChanged?: boolean): void {
		this.showMainSpinner();
        if (filterChanged) {
            this.pageNumber = 1;
        }
		const payload = this._packPayload();
		this.isLoading$.next(true);
		this._purchaseOrderService
			.getPurchaseOrdersList(
				payload.invoicingEntities,
                payload.clientsIds,
				payload.responsibleEmployees,
				payload.employeesTeamsAndDivisionsNodes,
				payload.employeesTenants,
				payload.chasingStatuses,
				payload.statuses,
                payload.noteStatuses,
                payload.capTypes,
                payload.capUnits,
				payload.showCompleted,
				payload.search,
				payload.pageNumber,
				payload.pageSize,
				payload.sort
			)
			.pipe(
				finalize(() => {
					this.hideMainSpinner();
					this.isLoading$.next(false);
				})
			)
			.subscribe((result: PurchaseOrderQueryDtoPaginatedList) => {
				this.dataSource = new MatTableDataSource<IPOGridData>(this._mapTableData(result.items));
				this.totalCount = result.totalCount;
				this.selectionModel.clear();
				this.saveGridOptions();
			});
	}

	resetAllFilters(): void {
		this.teamsAndDivisionsFilterState = {
			tenantIds: [],
			divisionIds: [],
			teamsIds: [],
		};
		this._teamsAndDivisionCounter(this.teamsAndDivisionsFilterState);
		this.treeFilter.reset();
		this.includeCompleted = false;
		this.selectedAccountManagers = [];
		this.searchFilter.reset('', { emitEvent: false });
		this.invoicingEntityControl.reset([], { emitEvent: false });
		this.chasingStatusesFilter.reset([], { emitEvent: false });
		this.statusesFilter.reset([], { emitEvent: false });
		localStorage.removeItem(PO_GRID_OPTIONS_KEY);
		this.getPurchaseOrdersList(true);
	}

	isAllSelected(): boolean {
		const numSelected = this.selectionModel.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected === numRows;
	}

	toggleAllRows(): void {
		this.isAllSelected()
			? this.selectionModel.clear()
			: this.dataSource.data.forEach((row) => this.selectionModel.select(row));
	}

	sortChange(event: Sort): void {
		this.sorting = event.direction && event.direction.length ? event.active.concat(' ', event.direction) : '';
		this.getPurchaseOrdersList();
	}

	pageChange(event: PageEvent): void {
		this.pageNumber = event.pageIndex + 1;
		this.defaultPageSize = event.pageSize;
		this.getPurchaseOrdersList();
	}

	editPo(actionRow: IPOGridData): void {
		const scrollStrategy = this._overlay.scrollStrategies.block();
        const dialogConfig = cloneDeep(BigDialogConfig);
		dialogConfig.scrollStrategy = scrollStrategy;
		dialogConfig.maxHeight = '700px';
		dialogConfig.data = {
			purchaseOrder: actionRow.originalPOData,
			isEdit: true,
			clientPeriodId: actionRow.clientPeriods[0]?.clientPeriodId,
			directClientId: actionRow.directClientIdReferencingThisPo,
			addedPoIds: [actionRow.id],
		};
		const dialogRef = this._dialog.open(AddOrEditPoDialogComponent, dialogConfig);

		dialogRef.componentInstance.confirmed.pipe(takeUntil(this._unSubscribe$)).subscribe(() => {
			this.getPurchaseOrdersList();
		});
	}

	chooseSelectionAction(actionType: EPoBotttomActionsType): void {
		switch (actionType) {
			case EPoBotttomActionsType.AssignEmaginePOResponsible:
				this._openBulkUpdateEmagineResponsibleDialog();
				break;
			case EPoBotttomActionsType.AssignClientPOResponsible:
				this._openBulkUpdateClientResponsibleDialog();
				break;
			case EPoBotttomActionsType.MarkAsCompleted:
				this._confirmMarkAsCompleted();
				break;
		}
	}

	filterChanged(event: any, filterType: string): void {
		switch (filterType) {
			case FILTER_LABEL_MAP.status:
				this.gridFilters.chasingStatuses = event.map((x) => x.id);
				break;
			case FILTER_LABEL_MAP.note:
				this.gridFilters.noteStatusIds = event.map((x) => x.id);
				break;
			case FILTER_LABEL_MAP.client:
				this.gridFilters.clientIds = event.map((x) => x.clientId);
				break;
			case FILTER_LABEL_MAP.clientContact:
				this.gridFilters.clientContactIds = event.map((x) => x.id);
				break;
			case FILTER_LABEL_MAP.consultant:
				this.gridFilters.consultantIds = event.map((x) => x.id);
				break;
			case FILTER_LABEL_MAP.salesTypeIds:
				this.gridFilters.salesTypeIds = event.map((x) => x.id);
				break;
			case FILTER_LABEL_MAP.deliveryTypeIds:
				this.gridFilters.deliveryTypeIds = event.map((x) => x.id);
				break;
			case FILTER_LABEL_MAP.capTypeIds:
				this.gridFilters.capTypeIds = event.map((x) => x.id);
				break;
			case FILTER_LABEL_MAP.unit:
				this.gridFilters.unitTypeId = event?.id;
				break;
			case FILTER_LABEL_MAP.clientRate:
				this.gridFilters.clientRateIds = event.map((x) => x.id);
				break;
			case FILTER_LABEL_MAP.contractManager:
				this.gridFilters.contractManagerIds = event.map((x) => x.id);
				break;
			case FILTER_LABEL_MAP.salesManager:
				this.gridFilters.salesManagerIds = event.map((x) => x.id);
				break;
		}
		this.getPurchaseOrdersList();
	}

	openConnectedWF(connectedPeriod: IPOClientPeriodGridData): void {
		const url = this._router.serializeUrl(
			this._router.createUrlTree([`/app/workflow/${connectedPeriod.workflowId}/${connectedPeriod.clientPeriodId}`])
		);
		window.open(url, '_blank');
	}

	teamsAndDivisionsChanged(teamsAndDivisionFilter: IDivisionsAndTeamsFilterState): void {
		this.teamsAndDivisionsFilterState = teamsAndDivisionFilter;
		this._teamsAndDivisionCounter(teamsAndDivisionFilter);
		this.getPurchaseOrdersList(true);
	}

	managersChanged(event: SelectableEmployeeDto[]): void {
		this.selectedAccountManagers = event;
		this.getPurchaseOrdersList(true);
	}

	private _openBulkUpdateClientResponsibleDialog(): void {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
        const dialogConfig = cloneDeep(MediumDialogConfig);
		dialogConfig.scrollStrategy = scrollStrategy;
		dialogConfig.data = {
			EBulkUpdateDiallogTypes: EBulkUpdateDiallogTypes.UpdateClientResponsible,
			dialogTitle: `Assign Client responsible`,
			dialogText: `You have selected ${this.selectionModel.selected.length} Purchase Orders. To whom would you like to assign them?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Assign',
			clientIds: this.selectionModel.selected.map((x) => x.directClientIdReferencingThisPo),
			purchaseOrderIds: this.selectionModel.selected.map((x) => x.id),
			isNegative: false,
		} as IBulkUpdateDialogData;
		const dialogRef = this._dialog.open(BulkUpdateDialogComponent, dialogConfig);

		dialogRef.componentInstance.confirmed.pipe(takeUntil(this._unSubscribe$)).subscribe((event: PurchaseOrdersSetClientContactResponsibleCommand) => {
			this._bulkUpdateClientResponsible(event);
		});
	}

	private _bulkUpdateClientResponsible(data: PurchaseOrdersSetClientContactResponsibleCommand): void {
		this.showMainSpinner();
		let input = new PurchaseOrdersSetClientContactResponsibleCommand(data);
		this._purchaseOrderService
			.setPurchaseOrdersClientContactResponsible(input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => this.getPurchaseOrdersList());
	}

	private _openBulkUpdateEmagineResponsibleDialog(): void {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
        const dialogConfig = cloneDeep(MediumDialogConfig);
		dialogConfig.scrollStrategy = scrollStrategy;
		dialogConfig.data = {
			EBulkUpdateDiallogTypes: EBulkUpdateDiallogTypes.UpdateEmagineResponsible,
			dialogTitle: `Assign emagine responsible`,
			dialogText: `You have selected ${this.selectionModel.selected.length} Purchase Orders. To whom would you like to assign them?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Assign',
			purchaseOrderIds: this.selectionModel.selected.map((x) => x.id),
			isNegative: false,
		} as IBulkUpdateDialogData;
		const dialogRef = this._dialog.open(BulkUpdateDialogComponent, dialogConfig);

		dialogRef.componentInstance.confirmed.pipe(takeUntil(this._unSubscribe$)).subscribe((event: PurchaseOrderSetEmagineResponsiblesCommand) => {
			this._bulkUpdateEnmagineResponsible(event);
		});
	}

	private _bulkUpdateEnmagineResponsible(data: PurchaseOrderSetEmagineResponsiblesCommand): void {
		this.showMainSpinner();
		let input = new PurchaseOrderSetEmagineResponsiblesCommand(data);
		this._purchaseOrderService
			.setPurchaseOrdersEmagineResponsibles(input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => this.getPurchaseOrdersList());
	}

	private _confirmMarkAsCompleted(): void {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
        const dialogConfig = cloneDeep(MediumDialogConfig);
		dialogConfig.scrollStrategy = scrollStrategy;
		dialogConfig.data = {
			confirmationMessageTitle: `Mark as completed`,
			confirmationMessage: `You have selected ${this.selectionModel.selected.length} Purchase Orders. Are you sure you want to proceed with marking them as completed`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Proceed',
			isNegative: true,
		};
		const dialogRef = this._dialog.open(ConfirmationDialogComponent, dialogConfig);

		dialogRef.componentInstance.onConfirmed.pipe(takeUntil(this._unSubscribe$)).subscribe(() => {
			this._markAsCompleted();
		});
	}

	private _markAsCompleted(): void {
		this.showMainSpinner();
		let input = new PurchaseOrdersSetIsCompletedCommand();
		input.isCompleted = true;
		input.purchaseOrdersIds = this.selectionModel.selected.map((x) => x.id);
		this._purchaseOrderService
			.setPurchaseOrdersIsCompleted(input)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe(() => this.getPurchaseOrdersList());
	}

	private _packPayload(): IPoListPayload {
		const { tenantIds, teamsIds, divisionIds } = this.teamsAndDivisionsFilterState;
		return {
			invoicingEntities: this.invoicingEntityControl.value?.map((x) => x.id) ?? [],
            clientsIds: [],
			responsibleEmployees: this.selectedAccountManagers?.map((x) => x.id) ?? [],
			employeesTeamsAndDivisionsNodes: teamsIds?.concat(divisionIds) ?? [],
			employeesTenants: tenantIds ?? [],
			chasingStatuses: this.chasingStatusesFilter.value ?? [],
			statuses: this.statusesFilter.value ?? [],
            noteStatuses: [],
            capTypes: [],
            capUnits: [],
			showCompleted: this.includeCompleted,
			search: this.searchFilter.value ?? '',
			pageNumber: this.pageNumber,
			pageSize: this.defaultPageSize,
			sort: this.sorting ?? '',
		} as IPoListPayload;
	}

	private _mapTableData(items: PurchaseOrderQueryDto[]): IPOGridData[] {
		return items.map((item) => {
			return {
				originalPOData: item,
                clientPeriods: this._mapClientPeriodsData(item.clientPeriodsReferencingThisPo),
				...item
			} as IPOGridData;
		});
	}

	private _mapClientPeriodsData(items: PurchaseOrderClientPeriodDto[]): IPOClientPeriodGridData[] {
		return items.map((item) => {
			return {
				originalClientPeriodData: item,
				clientPeriodId: item.clientPeriodId,
				salesType: this.findItemById(this.saleTypes, item.salesType)?.name,
				deliveryType: this.findItemById(this.deliveryTypes, item.deliveryType)?.name,
				workflowId: item.workflowId,
				displayId: item.displayId,
				consultants: item.consultants,
				clientRate: this._formatClientRate(item.clientRate),
				purchaseOrderCapClientCalculatedAmount: this._formatPOCapClientCalculatedAmount(item.purchaseOrderCapClientCalculatedMaxAmount),
                purchaseOrderCapClientCalculatedAmountLeft: this._formatPOCapClientCalculatedAmount(item.purchaseOrderCapClientCalculatedAmountLeft),
				estimatedUnitsLeft: `${ (item.estimatedUnitsLeft !== null && item.estimatedUnitsLeft !== undefined) ? item.estimatedUnitsLeft?.amount + ' ' + ValueUnitEnum[item.estimatedUnitsLeft?.unit] : '-' }`,
			} as IPOClientPeriodGridData;
		});
	}

    private _formatPOCapClientCalculatedAmount(value: AmountWithCurrencyDto): string {
        if (value === null || value === undefined) {
            return '-';
        } else {
            return `${value.amount} ${value.currency}`;
        }
    }

    private _formatClientRate(clientRate: ClientRateDto): string {
        if (clientRate === null || clientRate === undefined) {
            return '-';
        } else {
            return `${clientRate?.normalRate} ${this.eCurrencies[clientRate?.currencyId]} ${clientRate?.isTimeBasedRate ? '/' + this.findItemById(this.rateUnitTypes, clientRate?.rateUnitTypeId)?.name : ''}`
        }
    }

	private _teamsAndDivisionCounter(teamsAndDivisionFilter: IDivisionsAndTeamsFilterState): void {
		const { teamsIds, tenantIds, divisionIds } = teamsAndDivisionFilter;
		this.selectedTeamsAndDivisionsCount = teamsIds.length + tenantIds.length + divisionIds.length;
	}

	private _getEnums(): void {
		this.deliveryTypes = this.getStaticEnumValue('deliveryTypes');
		this.saleTypes = this.getStaticEnumValue('saleTypes');
		this.currencies = this.getStaticEnumValue('currencies');
		this.eCurrencies = this.arrayToEnum(this.currencies);
		this.valueUnitTypes = this.getStaticEnumValue('valueUnitTypes');
		this.purchaseOrderCapTypes = this.getStaticEnumValue('purchaseOrderCapTypes');
		this.legalEntities = this._mapLegalEntitiesIntoSelectable(this.getStaticEnumValue('legalEntities'));
        this.rateUnitTypes = this.getStaticEnumValue('rateUnitTypes');
	}

	private _mapLegalEntitiesIntoSelectable(entities: LegalEntityDto[]): SelectableCountry[] {
		return entities.map((x) => {
			return new SelectableCountry({
				id: x.id!,
				name: x.name!,
				tenantName: x.tenantName!,
				code: MapTenantCountryCode(x.tenantName!)!,
				selected: false,
				flag: x.tenantName!,
			});
		});
	}

    private _initPurchaseOrdersListObserver(): void {
        merge(
			this.chasingStatusesFilter.valueChanges,
			this.statusesFilter.valueChanges,
			this.searchFilter.valueChanges,
			this.invoicingEntityControl.valueChanges
		)
			.pipe(debounceTime(700), takeUntil(this._unSubscribe$))
			.subscribe(() => {
				this._checkIfDirty();
				this.getPurchaseOrdersList(true);
			});
    }

	private _checkIfDirty(): void {
		if (
			this.invoicingEntityControl.value?.length ||
			this.chasingStatusesFilter.value?.length ||
			this.statusesFilter.value?.length ||
			this.searchFilter.value?.length ||
			this.includeCompleted ||
			this.selectedTeamsAndDivisionsCount > 0
		) {
			this.isDirty$.next(true);
		} else {
			this.isDirty$.next(false);
		}
	}
}
