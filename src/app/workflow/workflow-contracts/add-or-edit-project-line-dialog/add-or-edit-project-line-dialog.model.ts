import { FormControl, FormGroup } from "@angular/forms";

export class ProjectLineForm extends FormGroup {
    constructor() {
        super({
            id: new FormControl(null),
            projectName: new FormControl(null),
            assignmentID: new FormControl(null),
            startDate: new FormControl(null),
            endDate: new FormControl(null),
            noEndDate: new FormControl(false),
            invoicingReferenceNumber: new FormControl(null),
            differentInvoicingReferenceNumber: new FormControl(false),
            invoicingReferencePersonId: new FormControl(null),
            optionalInvoicingInfo: new FormControl(null),
            debtorNumber: new FormControl(null),
            differentDebtorNumber: new FormControl(false),
            invoiceRecipientId: new FormControl(null),
            modifiedById: new FormControl(null),
            modificationDate: new FormControl(null),
            consultantInsuranceOptionId: new FormControl(null),
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
    get noEndDate() {
        return this.get('noEndDate');
    }
    get invoicingReferenceNumber() {
        return this.get('invoicingReferenceNumber');
    }
    get differentInvoicingReferenceNumber() {
        return this.get('differentInvoicingReferenceNumber');
    }
    get invoicingReferencePersonId() {
        return this.get('invoicingReferencePersonId');
    }
    get optionalInvoicingInfo() {
        return this.get('optionalInvoicingInfo');
    }
    get debtorNumber() {
        return this.get('debtorNumber');
    }
    get differentDebtorNumber() {
        return this.get('differentDebtorNumber');
    }
    get invoiceRecipientId() {
        return this.get('invoiceRecipientId');
    }
    get modifiedById() {
        return this.get('modifiedById');
    }
    get modificationDate() {
        return this.get('modificationDate');
    }
    get consultantInsuranceOptionId() {
        return this.get('consultantInsuranceOptionId');
    }
    get differentInvoiceRecipient() {
        return this.get('differentInvoiceRecipient');
    }
}