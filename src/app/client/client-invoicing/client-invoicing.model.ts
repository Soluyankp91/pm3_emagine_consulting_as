import { FormControl, FormGroup, Validators } from '@angular/forms';

export class NewConsultantCreateForm extends FormGroup {
    constructor() {
        super({
            monthly: new FormControl(false),
            period: new FormControl(false),
            mandatoryNumberOnContracts: new FormControl(false),
            showInRefList: new FormControl(false),
            specialRebate: new FormControl(false),
            debtorNumber: new FormControl(null),
            vatNumber: new FormControl(null),
            hourReportRequireVerification: new FormControl(false),
            specialInvoicingComments: new FormControl(null)
        });
    }

    get monthly() {
        return this.get('monthly');
    }
    get period() {
        return this.get('period');
    }
    get mandatoryNumberOnContracts() {
        return this.get('mandatoryNumberOnContracts');
    }
    get showInRefList() {
        return this.get('showInRefList');
    }
    get specialRebate() {
        return this.get('specialRebate');
    }
    get debtorNumber() {
        return this.get('debtorNumber');
    }
    get vatNumber() {
        return this.get('vatNumber');
    }
    get hourReportRequireVerification() {
        return this.get('hourReportRequireVerification');
    }
    get specialInvoicingComments() {
        return this.get('specialInvoicingComments');
    }
}
