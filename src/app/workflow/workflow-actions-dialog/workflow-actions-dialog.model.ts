import { FormArray, FormControl, FormGroup } from "@angular/forms";

export class ChangeWorkflowForm extends FormGroup {
    constructor() {
        super({
            cutoverDate: new FormControl(null),
            newLegalContractRequired: new FormControl(false),
            consultants: new FormArray([])
        })
    }
    get cutoverDate() {
        return this.get('cutoverDate');
    }
    get newLegalContractRequired() {
        return this.get('newLegalContractRequired');
    }
    get consultants() {
        return this.get('consultants') as FormArray;
    }
}

export class ExtendWorkflowForm extends FormGroup {
    constructor() {
        super({
            startDate: new FormControl(null),
            endDate: new FormControl(null),
            noEndDate: new FormControl(null),
            consultants: new FormArray([])
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
        return this.get('consultants') as FormArray;
    }
}