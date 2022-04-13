import { FormControl, FormGroup } from "@angular/forms";

export class ProjectLineForm extends FormGroup {
    constructor() {
        super({
            id: new FormControl(null),
            projectName: new FormControl(null),
            assignmentID: new FormControl(null),
            startDate: new FormControl(null),
            endDate: new FormControl(null),
            invoiceReference: new FormControl(null),
            optionalInvoicingInfo: new FormControl(null),
            debitorNumber: new FormControl(null),
            diffrentDebitorNumber: new FormControl(false),
            invoiceRecipient: new FormControl(null),
            differentInvoiceRecipient: new FormControl(false)
        })

    }
    get id() {
        return this.get('id');
    }
    get projectName() {
        return this.get('projectName');
    }
    get assignmentID() {
        return this.get('assignmentID');
    }
    get startDate() {
        return this.get('startDate');
    }
    get endDate() {
        return this.get('endDate');
    }
    get invoiceReference() {
        return this.get('invoiceReference');
    }
    get optionalInvoicingInfo() {
        return this.get('optionalInvoicingInfo');
    }
    get debitorNumber() {
        return this.get('debitorNumber');
    }
    get diffrentDebitorNumber() {
        return this.get('diffrentDebitorNumber');
    }
    get invoiceRecipient() {
        return this.get('invoiceRecipient');
    }
    get differentInvoiceRecipient() {
        return this.get('differentInvoiceRecipient');
    }
}