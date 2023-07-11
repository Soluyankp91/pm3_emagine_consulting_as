import { FormControl, FormGroup } from '@angular/forms';

export interface IWidget {
	id: number;
	name: string;
	logoUrl: string | null;
	logoWidthHeight: string;
	backgroundColor: string | null;
	url: string | null;
}

export enum EWidgetsIds {
	Sourcing = 1,
	PM3 = 2,
	UM = 3,
	Hubspot = 4,
	Actimo = 5,
	DocuSign = 6,
	PowerBI = 7,
	Talenttech = 8,
	Freshservice = 9,
	HRnest = 10,
    BIReports = 11,
	Website = 12,
	Intranet = 13,
	MarginCalculator = 14,
	Consultant = 15,
	Supplier = 16,
	Client = 17,
}

export class MarginCalculatorForm extends FormGroup {
	constructor() {
		super({
			clientPrice: new FormControl(null),
			consultantPrice: new FormControl(null),
			margin: new FormControl(null),
		});
	}

	get clientPrice() {
		return this.get('clientPrice');
	}

	get margin() {
		return this.get('margin');
	}

	get consultantPrice() {
		return this.get('consultantPrice');
	}
}
