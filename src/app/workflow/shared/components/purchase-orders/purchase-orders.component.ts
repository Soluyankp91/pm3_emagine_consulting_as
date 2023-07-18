import { Overlay } from '@angular/cdk/overlay';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EValueUnitTypes } from 'src/app/workflow/workflow-sales/workflow-sales.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import { BigDialogConfig, MediumDialogConfig } from 'src/shared/dialog.configs';
import {
	EnumEntityTypeDto,
	PurchaseOrderCapType,
	PurchaseOrderQueryDto,
	PurchaseOrderServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { AddOrEditPoDialogComponent } from './add-or-edit-po-dialog/add-or-edit-po-dialog.component';
import { EPurchaseOrderMode, PoForm } from './purchase-orders.model';

@Component({
	selector: 'purchase-orders',
	templateUrl: './purchase-orders.component.html',
	styleUrls: ['./purchase-orders.component.scss'],
})
export class PurchaseOrdersComponent extends AppComponentBase implements OnInit {
	@Input() periodId: string;
	@Input() workflowId: string;
	@Input() directClientId: number;
	@Input() readOnlyMode: boolean;
	@Input() mode: EPurchaseOrderMode;
	currencies: EnumEntityTypeDto[];
	poForm: PoForm;
	eValueUnitType = EValueUnitTypes;
	ePoCapType = PurchaseOrderCapType;
	purchaseOrderCapTypes: { [key: string]: string };
	purchaseOrdersList: PurchaseOrderQueryDto[];
	ePurchaseOrderMode = EPurchaseOrderMode;
	eCurrencies: { [key: number]: string };

	constructor(
		injector: Injector,
		private _overlay: Overlay,
		private _dialog: MatDialog,
		private _fb: UntypedFormBuilder,
		private readonly _purchaseOrderService: PurchaseOrderServiceProxy
	) {
		super(injector);
		this.poForm = new PoForm();
	}

	ngOnInit(): void {
		this._getEnums();
	}

	createOrEditPurchaseOrder(purchaseOrder?: PurchaseOrderQueryDto, orderIndex?: number) {
		const scrollStrategy = this._overlay.scrollStrategies.reposition();
		BigDialogConfig.scrollStrategy = scrollStrategy;
        BigDialogConfig.maxHeight = '700px';
		BigDialogConfig.data = {
			purchaseOrder: purchaseOrder,
			isEdit: !!purchaseOrder,
			clientPeriodId: this.periodId,
			directClientId: this.directClientId,
			addedPoIds: this.purchaseOrders.value.map((x) => x.id),
            purchaseOrderId: purchaseOrder.id,
		};
		const dialogRef = this._dialog.open(AddOrEditPoDialogComponent, BigDialogConfig);

		dialogRef.componentInstance.confirmed.subscribe((newPurchaseOrder: PurchaseOrderQueryDto) => {
			if (!!purchaseOrder) {
				this._updatePurchaseOrder(newPurchaseOrder, orderIndex);
			} else {
				this._addPurchaseOrder(newPurchaseOrder);
			}
		});
	}

    getPurchaseOrdersForOverview(workflowId: string) {
        this._purchaseOrderService.getPurchaseOrdersForWorkflowOverview(this.workflowId ?? workflowId)
            .subscribe(result => {
                this.purchaseOrdersList = result;
                this.purchaseOrders.controls = [];
				result.forEach(po => {
                    this._addPurchaseOrder(po);
                })
            })
    }

	getPurchaseOrders(purchaseOrderIds: number[], directClientId: number, periodId?: string) {
		this._purchaseOrderService
			.getPurchaseOrdersAvailableForClientPeriod(this.periodId ?? periodId, directClientId)
			.subscribe((result) => {
				this.purchaseOrdersList = result;
				this.purchaseOrders.controls = [];
				this._filterResponse(result, purchaseOrderIds);
			});
	}

	removePurchaseOrder(orderIndex: number) {
		this.purchaseOrders.removeAt(orderIndex);
	}

	updatePOs(purchaseOrder: PurchaseOrderQueryDto) {
		const POtoUpdate = this.purchaseOrders.controls.find((x) => x.value.id === purchaseOrder.id);
		if (POtoUpdate) {
			POtoUpdate.patchValue(purchaseOrder);
		}
	}

	private _filterResponse(list: PurchaseOrderQueryDto[], purchaseOrderIds: number[]) {
		switch (this.mode) {
			case EPurchaseOrderMode.WFOverview:
				list.filter((item) => item.purchaseOrderCurrentContextData?.existsInThisWorkflow).forEach((order) => {
					this._addPurchaseOrder(order);
				});
				break;
			case EPurchaseOrderMode.SalesStep:
			case EPurchaseOrderMode.ContractStep:
			case EPurchaseOrderMode.ProjectLine:
				list.filter((item) => purchaseOrderIds.includes(item.id)).forEach((order) => {
					this._addPurchaseOrder(order);
				});
				break;
		}
	}

	private _updatePurchaseOrder(purchaseOrder: PurchaseOrderQueryDto, orderIndex: number) {
		const formRow = this.purchaseOrders.at(orderIndex);
		formRow.get('id').setValue(purchaseOrder?.id, { emitEvent: false });
		formRow.get('number').setValue(purchaseOrder?.number, { emitEvent: false });
		formRow.get('numberMissingButRequired').setValue(purchaseOrder?.numberMissingButRequired, { emitEvent: false });
		formRow.get('receiveDate').setValue(purchaseOrder?.receiveDate, { emitEvent: false });
		formRow.get('startDate').setValue(purchaseOrder?.startDate, { emitEvent: false });
		formRow.get('endDate').setValue(purchaseOrder?.endDate, { emitEvent: false });
		formRow.get('clientContactResponsible').setValue(purchaseOrder?.clientContactResponsible, { emitEvent: false });
		formRow.get('notes').setValue(purchaseOrder?.notes, { emitEvent: false });
		formRow.get('createdBy').setValue(purchaseOrder?.createdBy, { emitEvent: false });
		formRow.get('createdOnUtc').setValue(purchaseOrder?.createdOnUtc, { emitEvent: false });
		formRow.get('modifiedBy').setValue(purchaseOrder?.modifiedBy, { emitEvent: false });
		formRow.get('modifiedOnUtc').setValue(purchaseOrder?.modifiedOnUtc, { emitEvent: false });
		formRow.get('workflowsIdsReferencingThisPo').setValue(purchaseOrder?.workflowsIdsReferencingThisPo, { emitEvent: false });
		formRow.get('notifyCM').setValue(purchaseOrder?.notifyCM, { emitEvent: false });
		formRow.get('isUnread').setValue(purchaseOrder?.isUnread, { emitEvent: false });
		formRow.get('isCompleted').setValue(purchaseOrder?.isCompleted, { emitEvent: false });
		formRow.get('chasingStatus').setValue(purchaseOrder?.chasingStatus, { emitEvent: false });
		formRow
			.get('existsInAnotherWorkflow')
			.setValue(purchaseOrder?.purchaseOrderCurrentContextData?.existsInAnotherWorkflow, { emitEvent: false });
		formRow
			.get('isUserAllowedToEdit')
			.setValue(purchaseOrder?.purchaseOrderCurrentContextData?.isUserAllowedToEdit, { emitEvent: false });
        formRow
			.get('purchaseOrderCurrentContextData')
			.setValue(purchaseOrder?.purchaseOrderCurrentContextData, { emitEvent: false });
        formRow
			.get('purchaseOrderDocumentQueryDto')
			.setValue(purchaseOrder?.purchaseOrderDocumentQueryDto, { emitEvent: false });
		const capForInvoicingForm = formRow.get('capForInvoicing') as UntypedFormGroup;
		capForInvoicingForm.get('type').setValue(purchaseOrder?.capForInvoicing?.type, { emitEvent: false });
		capForInvoicingForm
			.get('valueUnitTypeId')
			.setValue(purchaseOrder?.capForInvoicing?.valueUnitTypeId, { emitEvent: false });
		capForInvoicingForm.get('maxAmount').setValue(purchaseOrder?.capForInvoicing?.maxAmount, { emitEvent: false });
		capForInvoicingForm.get('currencyId').setValue(purchaseOrder?.capForInvoicing?.currencyId, { emitEvent: false });
		capForInvoicingForm.get('amountUsed').setValue(purchaseOrder?.capForInvoicing?.amountUsed, { emitEvent: false });
	}

	private _addPurchaseOrder(purchaseOrder: PurchaseOrderQueryDto) {
		const form = this._fb.group({
			id: new UntypedFormControl(purchaseOrder?.id ?? null),
			number: new UntypedFormControl(purchaseOrder?.number),
			numberMissingButRequired: new UntypedFormControl(purchaseOrder?.numberMissingButRequired),
			receiveDate: new UntypedFormControl(purchaseOrder?.receiveDate),
			startDate: new UntypedFormControl(purchaseOrder?.startDate),
			endDate: new UntypedFormControl(purchaseOrder?.endDate),
			clientContactResponsible: new UntypedFormControl(purchaseOrder?.clientContactResponsible),
			notes: new UntypedFormControl(purchaseOrder?.notes),
			capForInvoicing: new UntypedFormGroup({
				type: new UntypedFormControl(purchaseOrder?.capForInvoicing?.type),
				valueUnitTypeId: new UntypedFormControl(purchaseOrder?.capForInvoicing?.valueUnitTypeId),
				maxAmount: new UntypedFormControl(purchaseOrder?.capForInvoicing?.maxAmount),
				currencyId: new UntypedFormControl(purchaseOrder?.capForInvoicing?.currencyId),
				amountUsed: new UntypedFormControl(purchaseOrder?.capForInvoicing?.amountUsed),
			}),
			createdBy: new UntypedFormControl(purchaseOrder?.createdBy),
			createdOnUtc: new UntypedFormControl(purchaseOrder?.createdOnUtc),
			modifiedBy: new UntypedFormControl(purchaseOrder?.modifiedBy),
			modifiedOnUtc: new UntypedFormControl(purchaseOrder?.modifiedOnUtc),
			workflowsIdsReferencingThisPo: new UntypedFormControl(purchaseOrder?.workflowsIdsReferencingThisPo),
			isUserAllowedToEdit: new UntypedFormControl(purchaseOrder?.purchaseOrderCurrentContextData?.isUserAllowedToEdit),
			existsInAnotherWorkflow: new UntypedFormControl(
				purchaseOrder?.purchaseOrderCurrentContextData?.existsInAnotherWorkflow
			),
			purchaseOrderCurrentContextData: new UntypedFormControl(purchaseOrder?.purchaseOrderCurrentContextData),
			purchaseOrderDocumentQueryDto: new UntypedFormControl(purchaseOrder?.purchaseOrderDocumentQueryDto),
            notifyCM: new UntypedFormControl(purchaseOrder?.notifyCM ?? false),
            isUnread: new UntypedFormControl(purchaseOrder?.isUnread ?? false),
            isCompleted: new UntypedFormControl(purchaseOrder?.isCompleted ?? false),
            chasingStatus: new UntypedFormControl(purchaseOrder?.chasingStatus ?? null)
		});
		this.purchaseOrders.push(form);
	}

	private _getEnums() {
        this.purchaseOrderCapTypes = this.getStaticEnumValue('purchaseOrderCapTypes');
        this.currencies = this.getStaticEnumValue('currencies');
        this.eCurrencies = this.arrayToEnum(this.currencies);
	}

	get purchaseOrders(): UntypedFormArray {
		return this.poForm.get('purchaseOrders') as UntypedFormArray;
	}
}
