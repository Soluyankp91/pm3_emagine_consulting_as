import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { IdNameDto } from 'src/shared/service-proxies/service-proxies';

export class PurchaseOrderForm extends UntypedFormGroup {
	constructor() {
		super({
			id: new UntypedFormControl(null),
			poSource: new UntypedFormControl(null),
			number: new UntypedFormControl('', Validators.required),
			receiveDate: new UntypedFormControl(null),
			numberMissingButRequired: new UntypedFormControl(false),
			capForInvoicing: new CapForInvoicingForm(),
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
	constructor() {
		super({
			type: new UntypedFormControl(null),
			maxAmount: new UntypedFormControl(null, Validators.required),
			valueUnitTypeId: new UntypedFormControl(null),
			currencyId: new UntypedFormControl(null),
			amountUsed: new UntypedFormControl(null),
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

export enum EPOCaps {
	CapOnUnits = 1,
	CapOnValue = 2,
	NoCap = 3,
}
