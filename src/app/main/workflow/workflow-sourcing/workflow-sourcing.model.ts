import { FormArray, FormGroup } from "@angular/forms";
export class WorkflowSourcingConsultantsDataForm extends FormGroup {
    constructor() {
        super({
            consultantTerminationSourcingData: new FormArray([])
        })

    }
    get consultantTerminationSourcingData() {
        return this.get('consultantTerminationSourcingData') as FormArray;
    }
}
