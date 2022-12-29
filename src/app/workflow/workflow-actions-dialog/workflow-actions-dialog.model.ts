import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from "@angular/forms";

export class ChangeWorkflowForm extends UntypedFormGroup {
    constructor() {
        super({
            cutoverDate: new UntypedFormControl(null),
            newLegalContractRequired: new UntypedFormControl(false),
            consultants: new UntypedFormArray([])
        })
    }
    get cutoverDate() {
        return this.get('cutoverDate');
    }
    get newLegalContractRequired() {
        return this.get('newLegalContractRequired');
    }
    get consultants() {
        return this.get('consultants') as UntypedFormArray;
    }
}

export class ExtendWorkflowForm extends UntypedFormGroup {
    constructor() {
        super({
            startDate: new UntypedFormControl(null),
            endDate: new UntypedFormControl(null),
            noEndDate: new UntypedFormControl(null),
            consultants: new UntypedFormArray([])
        })
    }
    get startDate() {
        return this.get('startDate');
    }
    get endDate() {
        return this.get('endDate');
    }
    get noEndDate() {
        return this.get('noEndDate');
    }
    get consultants() {
        return this.get('consultants') as UntypedFormArray;
    }
}