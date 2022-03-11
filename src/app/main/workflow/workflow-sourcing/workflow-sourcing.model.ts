import { FormArray, FormGroup } from "@angular/forms";

export class WorkflowSourcingConsultantsDataForm extends FormGroup {
    constructor() {
        super({
            consultantData: new FormArray([])
        })

    }
    get consultantData() {
        return this.get('consultantData') as FormArray;
    }
}