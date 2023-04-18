import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PurchaseOrderCapDto, PurchaseOrderDto } from 'src/shared/service-proxies/service-proxies';

export class PurchaseOrderForm extends UntypedFormGroup {
	constructor(purchaseOrder?: PurchaseOrderDto) {
		super({
			id: new UntypedFormControl(purchaseOrder?.id ?? null),
			poSource: new UntypedFormControl(null),
			number: new UntypedFormControl(purchaseOrder?.number ?? ''),
			existingPo: new UntypedFormControl(''),
			receiveDate: new UntypedFormControl(purchaseOrder?.receiveDate ?? null),
			numberMissingButRequired: new UntypedFormControl(purchaseOrder?.numberMissingButRequired ?? false),
			capForInvoicing: new CapForInvoicingForm(purchaseOrder?.capForInvoicing),
		});
	}

	get id() {
		return this.get('id');
	}
	get poSource() {
		return this.get('poSource');
	}
	get number() {
		return this.get('number');
	}
	get existingPo() {
		return this.get('existingPo');
	}
	get receiveDate() {
		return this.get('receiveDate');
	}
	get numberMissingButRequired() {
		return this.get('numberMissingButRequired');
	}
	get capForInvoicing() {
		return this.get('capForInvoicing') as CapForInvoicingForm;
	}
}

export class CapForInvoicingForm extends UntypedFormGroup {
	constructor(purchaseOrderCap?: PurchaseOrderCapDto) {
		super({
			type: new UntypedFormControl(purchaseOrderCap?.type ?? 1),
			maxAmount: new UntypedFormControl(purchaseOrderCap?.maxAmount ?? null),
			valueUnitTypeId: new UntypedFormControl(purchaseOrderCap?.valueUnitTypeId ?? null),
			currencyId: new UntypedFormControl(purchaseOrderCap?.currencyId ?? null),
			amountUsed: new UntypedFormControl(purchaseOrderCap?.amountUsed ?? null),
		});
	}

	get type() {
		return this.get('type');
	}
	get maxAmount() {
		return this.get('maxAmount');
	}
	get valueUnitTypeId() {
		return this.get('valueUnitTypeId');
	}
	get currencyId() {
		return this.get('currencyId');
	}
	get amountUsed() {
		return this.get('amountUsed');
	}
}

export enum EPOSource {
	ExistingPO = 1,
	DifferentWF = 2,
	NewPO = 3,
}

export const POSources = [
	{
		id: EPOSource.ExistingPO,
		name: 'Existing PO',
	},
	{
		id: EPOSource.DifferentWF,
		name: 'Different WF',
	},
	{
		id: EPOSource.NewPO,
		name: 'New PO',
	},
];