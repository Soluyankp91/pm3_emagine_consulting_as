import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PurchaseOrderCapDto, PurchaseOrderQueryDto } from 'src/shared/service-proxies/service-proxies';
import { CustomValidators } from 'src/shared/utils/custom-validators';

export class PurchaseOrderForm extends UntypedFormGroup {
	constructor(purchaseOrder?: PurchaseOrderQueryDto) {
		super({
			id: new UntypedFormControl(purchaseOrder?.id ?? null),
			poSource: new UntypedFormControl(null),
			number: new UntypedFormControl(purchaseOrder?.number ?? ''),
			existingPo: new UntypedFormControl('', CustomValidators.autocompleteValidator(['id'])),
			receiveDate: new UntypedFormControl(purchaseOrder?.receiveDate ?? null),
            startDate: new UntypedFormControl(purchaseOrder?.startDate ?? null),
            endDate: new UntypedFormControl(purchaseOrder?.endDate ?? null),
            isCompleted: new UntypedFormControl(purchaseOrder?.isCompleted ?? false),
			numberMissingButRequired: new UntypedFormControl(purchaseOrder?.numberMissingButRequired ?? false),
            notes: new UntypedFormControl(purchaseOrder?.notes ?? ''),
            clientContactResponsible: new UntypedFormControl(purchaseOrder?.clientContactResponsible ?? null),
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
    get startDate() {
		return this.get('startDate');
	}
    get endDate() {
		return this.get('endDate');
	}
    get isCompleted() {
		return this.get('isCompleted');
	}
    get notes() {
		return this.get('notes');
	}
    get clientContactResponsible() {
		return this.get('clientContactResponsible');
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
