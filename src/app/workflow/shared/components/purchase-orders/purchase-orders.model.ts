import { UntypedFormGroup, UntypedFormArray } from "@angular/forms";

export class PoForm extends UntypedFormGroup {
	constructor() {
		super({
			purchaseOrders: new UntypedFormArray([]),
		});
	}

	get purchaseOrders() {
		return this.get('purchaseOrders') as UntypedFormArray;
	}
}

export enum EPurchaseOrderMode {
    WFOverview = 1,
    SalesStep = 2,
    ContractStep = 3,
    ProjectLine = 4
}
