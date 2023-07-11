import { SelectionModel } from '@angular/cdk/collections';
import { Component, Injector, OnInit, TrackByFunction, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AppConsts } from 'src/shared/AppConsts';
import { DISPLAYED_COLUMNS, FILTER_LABEL_MAP, PO_BOTTOM_ACTIONS } from './po-list.constants';
import { TitleService } from 'src/shared/common/services/title.service';
import { ERouteTitleType } from 'src/shared/AppEnums';
import { FormControl, FormGroup } from '@angular/forms';
import { SelectableEmployeeDto } from '../workflow/workflow.model';
import { EnumEntityTypeDto, PurchaseOrderCapType, PurchaseOrderChasingStatus, PurchaseOrderClientPeriodDto, PurchaseOrderQueryDto, PurchaseOrderQueryDtoPaginatedList, PurchaseOrderServiceProxy, PurchaseOrderSetEmagineResponsiblesCommand, PurchaseOrdersSetClientContactResponsibleCommand, PurchaseOrdersSetIsCompletedCommand, ValueUnitEnum } from 'src/shared/service-proxies/service-proxies';
import { debounceTime, finalize, map, takeUntil } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Actions, EPOChasingStatusText, EPoBotttomActionsType, IGridFilters, IPOClientPeriodGridData, IPOGridData, IPoListPayload } from './po-list.model';
import { GridHelpService } from '../contracts/shared/services/mat-grid-service.service';
import { ReplaySubject, Subject } from 'rxjs';
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
import { EBulkUpdateDiallogTypes } from './components/bulk-update-dialog/bulk-update.dialog.model';
import { AddOrEditPoDialogComponent } from '../workflow/shared/components/purchase-orders/add-or-edit-po-dialog/add-or-edit-po-dialog.component';

const POGridOptionsKey = 'PurchaseOrdersGridFILTERS.1.0.0'
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
	providers: [GridHelpService],
})
export class PoListComponent extends AppComponentBase implements OnInit {
	@ViewChild('treeFilter') treeFilter: DivisionsAndTeamsFilterComponent;
	initialSelection = [];
	allowMultiSelect = true;
	selectedItemsActions: Actions[] = PO_BOTTOM_ACTIONS;
	selectedRowId: number;
	selectionModel = new SelectionModel<IPOGridData>(this.allowMultiSelect, this.initialSelection);
	displayedColumns = DISPLAYED_COLUMNS;
	dataSource = new MatTableDataSource<IPOGridData>();
	sortActive: string;
	sotrDirection: SortDirection;
	totalCount: number;
	pageSizeOptions = [5, 10, 20, 100];
	defaultPageSize = AppConsts.grid.defaultPageSize;
	pageNumber = 1;
	sorting = '';
	invoicingEntityControl = new FormControl();
	paymentEntityControl = new FormControl();
	searchFilter = new FormControl('');
	selectedAccountManagers: SelectableEmployeeDto[] = [];
	includeCompleted: boolean;
	expandedElement: any;
	ePurchaseOrderChasingStatus = EPOChasingStatusText;
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

	currentRowId$: ReplaySubject<number | null> = new ReplaySubject(1);
	currentRowId: number | null;
	teamsAndDivisionsFilterState: IDivisionsAndTeamsFilterState = {
		tenantIds: [],
		teamsIds: [],
		divisionIds: [],
	};
	selectedTeamsAndDivisionsCount: number = 0;
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
        this.searchFilter.valueChanges.pipe(takeUntil(this._unSubscribe$), debounceTime(500)).subscribe(() => {
            this.getPurchaseOrdersList();
        })
	}

	ngOnInit(): void {
		this._titleService.setTitle(ERouteTitleType.POList);
		this._getEnums();
		this.getGridOptions();
	}

	onSortChange($event: Sort) {}

	onFormControlChange($event: any) {}

	resetAllTopFilters() {}

	saveGridOptions() {
		let filters = {
			pageNumber: this.pageNumber,
			defaultPageSize: this.defaultPageSize,
			sorting: this.sorting,
			owners: this.selectedAccountManagers,
			invoicingEntity: this.invoicingEntityControl.value ? this.invoicingEntityControl.value : undefined,
			paymentEntity: this.paymentEntityControl.value ? this.paymentEntityControl.value : undefined,

			includeCompleted: this.includeCompleted,
			searchFilter: this.searchFilter.value ? this.searchFilter.value : '',
			ownerTenantsIds: this.teamsAndDivisionsFilterState.tenantIds,
			ownerDivisionsIds: this.teamsAndDivisionsFilterState.divisionIds,
			ownerTeamsIds: this.teamsAndDivisionsFilterState.teamsIds,
		};

		localStorage.setItem(POGridOptionsKey, JSON.stringify(filters));
	}

	getGridOptions() {
		let filters = JSON.parse(localStorage.getItem(POGridOptionsKey)!);
		if (filters) {
			this.pageNumber = filters.pageNumber;
			this.defaultPageSize = filters.defaultPageSize;
			this.sorting = filters.sorting;
			this.selectedAccountManagers = filters.owners?.length ? filters.owners : [];
			this.invoicingEntityControl.setValue(filters.invoicingEntity, { emitEvent: false });
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

	getPurchaseOrdersList() {
        this.showMainSpinner();
		const payload = this._packPayload();
		this._purchaseOrderService
			.getPurchaseOrdersList(
				payload.invoicingEntities,
				payload.responsibleEmployees,
				payload.employeesTeamsAndDivisionsNodes,
				payload.employeesTenants,
				payload.chasingStatuses,
				payload.statuses,
				payload.showCompleted,
				payload.search,
				payload.pageNumber,
				payload.pageSize,
				payload.sort
			)
			.pipe(finalize(() => this.hideMainSpinner()))
			.subscribe((result: PurchaseOrderQueryDtoPaginatedList) => {
				console.log(result.items);
				this.dataSource = new MatTableDataSource<IPOGridData>(this._mapTableData(result.items));
				this.totalCount = result.totalCount;
                this.selectionModel.clear();
			});
	}

	resetAllFilters() {
		this.teamsAndDivisionsFilterState = {
			tenantIds: [],
			divisionIds: [],
			teamsIds: [],
		};
		this._teamsAndDivisionCounter(this.teamsAndDivisionsFilterState);
		this.treeFilter.reset();
	}

	isAllSelected() {
		const numSelected = this.selectionModel.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected === numRows;
	}
	toggleAllRows() {
		this.isAllSelected()
			? this.selectionModel.clear()
			: this.dataSource.data.forEach((row) => this.selectionModel.select(row));
	}

	sortChange(event: Sort) {}

	pageChange(event: PageEvent) {
        this.pageNumber = event.pageIndex + 1;
		this.defaultPageSize = event.pageSize;
		this.getPurchaseOrdersList();
    }

	editPo(actionRow: IPOGridData) {
        const scrollStrategy = this._overlay.scrollStrategies.block();
		BigDialogConfig.scrollStrategy = scrollStrategy;
        BigDialogConfig.height = '700px';
		BigDialogConfig.data = {
			purchaseOrder: actionRow.originalPOData,
			isEdit: true,
			clientPeriodId: actionRow.clientPeriodsReferencingThisPo[0]?.clientPeriodId,
			directClientId: actionRow.directClientIdReferencingThisPo,
			addedPoIds: [actionRow.id],
		};
		const dialogRef = this._dialog.open(AddOrEditPoDialogComponent, BigDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((newPurchaseOrder: PurchaseOrderQueryDto) => {
			this.getPurchaseOrdersList();
		});
    }

	chooseSelectionAction(actionType: EPoBotttomActionsType) {
		switch (actionType) {
			case EPoBotttomActionsType.AssignEmaginePOResponsible:
				this._openBulkUpdateEnmagineResponsibleDialog();
				break;
			case EPoBotttomActionsType.AssignClientPOResponsible:
				this._openBulkUpdateClientResponsibleDialog();
				break;
			case EPoBotttomActionsType.MarkAsCompleted:
				this._confirmMarkAsCompleted();
				break;
		}
	}

	filterChanged(event: any, filterType: string) {
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

	openConnectedWF(connectedPeriod: IPOClientPeriodGridData) {
		const url = this._router.serializeUrl(
			this._router.createUrlTree([`/app/workflow/${connectedPeriod.workflowId}/${connectedPeriod.clientPeriodId}`])
		);
		window.open(url, '_blank');
	}

	teamsAndDivisionsChanged(teamsAndDivisionFilter: IDivisionsAndTeamsFilterState) {
		this.teamsAndDivisionsFilterState = teamsAndDivisionFilter;
		this._teamsAndDivisionCounter(teamsAndDivisionFilter);
		this.getPurchaseOrdersList();
	}

	managersChanged(event: SelectableEmployeeDto[]) {
		this.selectedAccountManagers = event;
		this.getPurchaseOrdersList();
	}

    private _openBulkUpdateClientResponsibleDialog() {
        const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
            dialogType: EBulkUpdateDiallogTypes.UpdateClientResponsible,
			dialogTitle: `Assign Client responsible`,
			dialogText: `You have selected ${this.selectionModel.selected.length} Purchase Orders. To whom would you like to assign them?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Assign',
            clientIds: this.selectionModel.selected.map(x => x.directClientIdReferencingThisPo),
            purchaseOrderIds: this.selectionModel.selected.map(x => x.id),
			isNegative: false,
		};
		const dialogRef = this._dialog.open(BulkUpdateDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((event: PurchaseOrdersSetClientContactResponsibleCommand) => {
			this._bulkUpdateClientResponsible(event);
		});
    }

    private _bulkUpdateClientResponsible(data: PurchaseOrdersSetClientContactResponsibleCommand) {
        this.showMainSpinner();
        let input = new PurchaseOrdersSetClientContactResponsibleCommand(data);
        this._purchaseOrderService.setPurchaseOrdersClientContactResponsible(input)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => this.getPurchaseOrdersList());
    }

    private _openBulkUpdateEnmagineResponsibleDialog() {
        const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
            dialogType: EBulkUpdateDiallogTypes.UpdateEmagineResponsible,
			dialogTitle: `Assign emagine responsible`,
			dialogText: `You have selected ${this.selectionModel.selected.length} Purchase Orders. To whom would you like to assign them?`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Assign',
            purchaseOrderIds: this.selectionModel.selected.map(x => x.id),
			isNegative: false,
		};
		const dialogRef = this._dialog.open(BulkUpdateDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe((event: PurchaseOrderSetEmagineResponsiblesCommand) => {
			this._bulkUpdateEnmagineResponsible(event);
		});
    }

    private _bulkUpdateEnmagineResponsible(data: PurchaseOrderSetEmagineResponsiblesCommand) {
        this.showMainSpinner();
        let input = new PurchaseOrderSetEmagineResponsiblesCommand(data);
        this._purchaseOrderService.setPurchaseOrdersEmagineResponsibles(input)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => this.getPurchaseOrdersList());
    }

	private _confirmMarkAsCompleted() {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		MediumDialogConfig.scrollStrategy = scrollStrategy;
		MediumDialogConfig.data = {
			confirmationMessageTitle: `Mark as completed`,
			confirmationMessage: `You have selected ${this.selectionModel.selected.length} Purchase Orders. Are you sure you want to proceed with marking them as completed`,
			rejectButtonText: 'Cancel',
			confirmButtonText: 'Complete',
			isNegative: true,
		};
		const dialogRef = this._dialog.open(ConfirmationDialogComponent, MediumDialogConfig);

		dialogRef.componentInstance.onConfirmed.subscribe(() => {
			this._markAsCompleted();
		});
	}

	private _markAsCompleted() {
        this.showMainSpinner();
        let input = new PurchaseOrdersSetIsCompletedCommand();
        input.isCompleted = true;
        input.purchaseOrdersIds = this.selectionModel.selected.map(x => x.id);
        this._purchaseOrderService.setPurchaseOrdersIsCompleted(input)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => this.getPurchaseOrdersList());
    }

	private _packPayload() {
		return {
			invoicingEntities: [],
			responsibleEmployees: [],
			employeesTeamsAndDivisionsNodes: [],
			employeesTenants: [],
			chasingStatuses: this.gridFilters.chasingStatuses,
			statuses: [],
			showCompleted: true,
			search: this.searchFilter.value ?? '',
			pageNumber: this.pageNumber - 1,
			pageSize: this.defaultPageSize,
			sort: this.sorting ?? '',
		} as IPoListPayload;
	}

	private _mapTableData(items: PurchaseOrderQueryDto[]): IPOGridData[] {
		return items.map((item) => {
			return {
                originalPOData: item,
				id: item.id,
				number: item.number,
				numberMissingButRequired: item.numberMissingButRequired,
				receiveDate: item.receiveDate,
				startDate: item.startDate,
				endDate: item.endDate,
				chasingStatus: item.chasingStatus,
				status: item.status,
				isCompleted: item.isCompleted,
				capForInvoicing: item.capForInvoicing,
				notes: item.notes,
				isUnread: item.isUnread,
				notifyCM: item.notifyCM,
				directClientIdReferencingThisPo: item.directClientIdReferencingThisPo,
				directClientNameReferencingThisPo: item.directClientNameReferencingThisPo,
				chasingStatusHistory: item.chasingStatusHistory,
				purchaseOrderCurrentContextData: item.purchaseOrderCurrentContextData,
				workflowsIdsReferencingThisPo: item.workflowsIdsReferencingThisPo,
				clientPeriodsReferencingThisPo: this._mapClientPeriodsData(item.clientPeriodsReferencingThisPo),
				isLinkedToAnyProjectLine: item.isLinkedToAnyProjectLine,
				salesResponsible: item.salesResponsible,
				contractResponsible: item.contractResponsible,
				clientContactResponsible: item.clientContactResponsible,
				noteStatus: item.noteStatus,
				createdBy: item.createdBy,
				createdOnUtc: item.createdOnUtc,
				modifiedBy: item.modifiedBy,
				modifiedOnUtc: item.modifiedOnUtc,
				purchaseOrderDocumentQueryDto: item.purchaseOrderDocumentQueryDto,
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
				clientRate: `${item.clientRate?.normalRate} ${this.eCurrencies[item.clientRate?.currencyId]} ${
					item.clientRate?.isTimeBasedRate ? '/' + ValueUnitEnum[item.clientRate?.rateUnitTypeId] : ''
				}`,
				purchaseOrderCapClientCalculatedAmount: `${item.purchaseOrderCapClientCalculatedAmount?.amount} ${
					item.purchaseOrderCapClientCalculatedAmount?.currency
						? item.purchaseOrderCapClientCalculatedAmount?.currency
						: ValueUnitEnum[item.purchaseOrderCapClientCalculatedAmount?.unit]
				}`,
				estimatedUnitsLeft: `${item.estimatedUnitsLeft?.amount} ${
					item.estimatedUnitsLeft?.currency
						? item.estimatedUnitsLeft?.currency
						: ValueUnitEnum[item.estimatedUnitsLeft?.unit]
				}`,
			} as IPOClientPeriodGridData;
		});
	}

	private _teamsAndDivisionCounter(teamsAndDivisionFilter: IDivisionsAndTeamsFilterState) {
		const { teamsIds, tenantIds, divisionIds } = teamsAndDivisionFilter;
		this.selectedTeamsAndDivisionsCount = teamsIds.length + tenantIds.length + divisionIds.length;
	}

	private _getEnums() {
		this.deliveryTypes = this.getStaticEnumValue('deliveryTypes');
		this.saleTypes = this.getStaticEnumValue('saleTypes');
		this.currencies = this.getStaticEnumValue('currencies');
		this.eCurrencies = this.arrayToEnum(this.currencies);
		this.valueUnitTypes = this.getStaticEnumValue('valueUnitTypes');
		this.purchaseOrderCapTypes = this.getStaticEnumValue('purchaseOrderCapTypes');
	}
}
