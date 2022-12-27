import { UntypedFormArray, UntypedFormGroup } from "@angular/forms";
export class WorkflowSourcingConsultantsDataForm extends UntypedFormGroup {
    constructor() {
        super({
            consultantTerminationSourcingData: new UntypedFormArray([])
        })

    }
    get consultantTerminationSourcingData() {
        return this.get('consultantTerminationSourcingData') as UntypedFormArray;
    }
}
