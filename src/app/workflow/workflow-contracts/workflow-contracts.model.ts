import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class WorkflowContractsMainForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null),
            deliveryType: new FormControl(null),
            projectType: new FormControl(null),
            margin: new FormControl(null),
            projectDescription: new FormControl(null),
            discounts: new FormControl(null),
            remarks: new FormControl(null),
            noRemarks: new FormControl(false)
        });
    }

    get salesType() {
        return this.get('salesType');
    }
    get deliveryType() {
        return this.get('deliveryType');
    }
    get projectType() {
        return this.get('projectType');
    }
    get margin() {
        return this.get('margin');
    }
    get projectDescription() {
        return this.get('projectDescription');
    }
    get discounts() {
        return this.get('discounts');
    }
    get remarks() {
        return this.get('remarks');
    }
    get noRemarks() {
        return this.get('noRemarks');
    }
}

export class WorkflowContractsSyncForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null),
            deliveryType: new FormControl(null),
            projectDescription: new FormControl(null),
            discounts: new FormControl(null),
            remarks: new FormControl(null),
            manualCheckbox: new FormControl(false),
            newLegalContract: new FormControl(false),
            consultants: new FormArray([])
        });
    }

    get salesType() {
        return this.get('salesType');
    }
    get deliveryType() {
        return this.get('deliveryType');
    }
    get projectDescription() {
        return this.get('projectDescription');
    }
    get discounts() {
        return this.get('discounts');
    }
    get remarks() {
        return this.get('remarks');
    }
    get manualCheckbox() {
        return this.get('manualCheckbox');
    }
    get newLegalContract() {
        return this.get('newLegalContract');
    }
    get consultants() {
        return this.get('consultants') as FormArray;
    }
}

export class WorkflowContractsClientDataForm extends FormGroup {
    constructor() {
        super({
            // capOnTimeReporting: new FormControl(null),
            directClientId: new FormControl(null),
            pdcInvoicingEntityId: new FormControl(null),
            clientTimeReportingCapId: new FormControl(null),
            clientTimeReportingCapMaxValue: new FormControl(null),
            clientTimeReportingCapCurrencyId: new FormControl(null),

            specialContractTerms: new FormControl(null),
            noSpecialContractTerms: new FormControl(null),
            clientRates: new FormArray([]),
            clientFees: new FormArray([]),

        });
    }

    // get capOnTimeReporting() {
    //     return this.get('capOnTimeReporting');
    // }
    get directClientId() {
        return this.get('directClientId');
    }
    get pdcInvoicingEntityId() {
        return this.get('pdcInvoicingEntityId');
    }
    get clientTimeReportingCapId() {
        return this.get('clientTimeReportingCapId');
    }
    get clientTimeReportingCapMaxValue() {
        return this.get('clientTimeReportingCapMaxValue');
    }
    get clientTimeReportingCapCurrencyId() {
        return this.get('clientTimeReportingCapCurrencyId');
    }
    get specialContractTerms() {
        return this.get('specialContractTerms');
    }
    get noSpecialContractTerms() {
        return this.get('noSpecialContractTerms');
    }
    get clientRates() {
        return this.get('clientRates') as FormArray;
    }
    get clientFees() {
        return this.get('clientFees') as FormArray;
    }
}

export class WorkflowContractsConsultantsDataForm extends FormGroup {
    constructor() {
        super({
            consultants: new FormArray([])
        })

    }
    get consultants() {
        return this.get('consultants') as FormArray;
    }
}

export class WorkflowConsultantsLegalContractForm extends FormGroup {
    constructor() {
        super({
            consultants: new FormArray([])
        })

    }
    get consultants() {
        return this.get('consultants') as FormArray;
    }
}


export class WorkflowContractsTerminationConsultantsDataForm extends FormGroup {
    constructor() {
        super({
            consultantTerminationContractData: new FormArray([])
        })

    }
    get consultantTerminationContractData() {
        return this.get('consultantTerminationContractData') as FormArray;
    }
}
