import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { finalize, map } from 'rxjs/operators';
import { WorkflowDataService } from 'src/app/workflow/workflow-data.service';
import { EValueUnitTypes } from 'src/app/workflow/workflow-sales/workflow-sales.model';
import { AppComponentBase } from 'src/shared/app-component-base';
import {
	EnumEntityTypeDto,
	PurchaseOrderCapDto,
	PurchaseOrderCapType,
	PurchaseOrderCurrentContextDto,
	PurchaseOrderDto,
	PurchaseOrderServiceProxy,
} from 'src/shared/service-proxies/service-proxies';
import { EPOSource, POSources, PurchaseOrderForm } from './add-or-edit-po-dialog.model';

@Component({
	selector: 'app-add-or-edit-po-dialog',
	templateUrl: './add-or-edit-po-dialog.component.html',
	styleUrls: ['./add-or-edit-po-dialog.component.scss'],
})
export class AddOrEditPoDialogComponent extends AppComponentBase implements OnInit {
	@Output() onConfirmed: EventEmitter<PurchaseOrderDto> = new EventEmitter<PurchaseOrderDto>();
	@Output() onRejected: EventEmitter<any> = new EventEmitter<any>();
	purchaseOrderForm: PurchaseOrderForm;
	purchaseOrderCapTypes: { [key: string]: string };
	currencies: EnumEntityTypeDto[];
	eCurrencies: { [key: number]: string };
	valueUnitTypes: EnumEntityTypeDto[];
	poSources = POSources;
	ePOSource = EPOSource;
	ePOCaps = PurchaseOrderCapType;
	purchaseOrders: PurchaseOrderDto[];
	filteredPurchaseOrders: PurchaseOrderDto[];
	existingPo: PurchaseOrderDto;
	eValueUnitType = EValueUnitTypes;
	constructor(
		injector: Injector,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			purchaseOrder: PurchaseOrderDto;
			isEdit: boolean;
			clientPeriodId: string;
			directClientId?: number;
			addedPoIds: number[];
		},
		private _dialogRef: MatDialogRef<AddOrEditPoDialogComponent>,
		private readonly _purchaseOrderService: PurchaseOrderServiceProxy,
		private readonly _workflowDataService: WorkflowDataService
	) {
		super(injector);
		this.purchaseOrderForm = new PurchaseOrderForm(this.data?.purchaseOrder);
	}

	ngOnInit(): void {
		this._getPurchaseOrders();
		this._getEnums();
	}

	reject() {
		this.onRejected.emit();
		this._closeInternal();
	}

	confirm() {
		this.showMainSpinner();
		const form = this.purchaseOrderForm.value;
		let input = new PurchaseOrderDto(form);
		input.workflowsIdsReferencingThisPo = [];
		input.capForInvoicing = new PurchaseOrderCapDto(form.capForInvoicing);
		if (form.id !== null) {
			this._purchaseOrderService
				.purchaseOrderPUT(this.data?.clientPeriodId, input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe((result) => {
					this._workflowDataService.updatePurchaseOrders.emit();
					this.onConfirmed.emit(result);
					this._closeInternal();
				});
		} else {
			this._purchaseOrderService
				.purchaseOrderPOST(input)
				.pipe(finalize(() => this.hideMainSpinner()))
				.subscribe((result) => {
					result.purchaseOrderCurrentContextData = new PurchaseOrderCurrentContextDto({
						isUserAllowedToEdit: true,
					});
					this.onConfirmed.emit(result);
					this._closeInternal();
				});
		}
	}

	disableInputs(value: boolean) {
		if (value) {
			this.purchaseOrderForm.number.setValue(null, { emitEvent: false });
			this.purchaseOrderForm.receiveDate.setValue(null, { emitEvent: false });
			this.purchaseOrderForm.number.disable();
			this.purchaseOrderForm.receiveDate.disable();
		} else {
			this.purchaseOrderForm.number.enable();
			this.purchaseOrderForm.receiveDate.enable();
		}
	}

	poSelected(event: MatSelectChange) {
		this.existingPo = event.value;
		this.purchaseOrderForm.patchValue(event.value, { emitEvent: false });
		if (!this.existingPo.purchaseOrderCurrentContextData.isUserAllowedToEdit) {
			this._disableAllEditableInputs();
		}
	}

	poSourceChange(event: MatSelectChange) {
		this.existingPo = new PurchaseOrderDto();
		if (event.value === EPOSource.DifferentWF || event.value === EPOSource.ExistingPO) {
			this.purchaseOrderForm.existingPo.reset(null, { emitEvent: false });
			this.filteredPurchaseOrders = this._filterOutPOs(event.value as EPOSource);
		} else {
			this.purchaseOrderForm.enable();
		}
	}

	sharedCapTypeChange(capType: number) {
		switch (capType) {
			case PurchaseOrderCapType.CapOnUnits:
				this.purchaseOrderForm.capForInvoicing.maxAmount.reset(null);
				this.purchaseOrderForm.capForInvoicing.currencyId.reset(null);
				break;
			case PurchaseOrderCapType.CapOnValue:
				this.purchaseOrderForm.capForInvoicing.maxAmount.reset(null);
				this.purchaseOrderForm.capForInvoicing.valueUnitTypeId.reset(null);
				break;
			case PurchaseOrderCapType.NoCap:
				this.purchaseOrderForm.capForInvoicing.maxAmount.reset(null);
				this.purchaseOrderForm.capForInvoicing.valueUnitTypeId.reset(null);
				this.purchaseOrderForm.capForInvoicing.currencyId.reset(null);
				break;
		}
	}

	private _disableAllEditableInputs() {
		this.purchaseOrderForm.number.disable({ emitEvent: false });
		this.purchaseOrderForm.receiveDate.disable({ emitEvent: false });
		this.purchaseOrderForm.capForInvoicing.type.disable({ emitEvent: false });
		this.purchaseOrderForm.capForInvoicing.maxAmount.disable({ emitEvent: false });
		this.purchaseOrderForm.capForInvoicing.valueUnitTypeId.disable({ emitEvent: false });
		this.purchaseOrderForm.capForInvoicing.currencyId.disable({ emitEvent: false });
	}

	private _closeInternal(): void {
		this._dialogRef.close();
	}

	private _getPurchaseOrders() {
		this._purchaseOrderService
			.getPurchaseOrdersAvailableForClientPeriod(this.data?.clientPeriodId, this.data?.directClientId ?? undefined)
			.pipe(map((pos: PurchaseOrderDto[]) => pos.filter((po) => !this.data?.addedPoIds.includes(po.id))))
			.subscribe((filteredPos) => {
				this.purchaseOrders = filteredPos;
			});
	}

	private _getEnums() {
        this.purchaseOrderCapTypes = this.getStaticEnumValue('purchaseOrderCapTypes');
        this.currencies = this.getStaticEnumValue('currencies');
        this.valueUnitTypes = this.getStaticEnumValue('valueUnitTypes');
        this.eCurrencies = this.arrayToEnum(this.currencies);
	}

	private _filterOutPOs(poSource: EPOSource) {
		const poExistsOnThisWf = poSource === EPOSource.ExistingPO;
		return this.purchaseOrders.filter((x) => x.purchaseOrderCurrentContextData.existsInThisWorkflow === poExistsOnThisWf);
	}
}
