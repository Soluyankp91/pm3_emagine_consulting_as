import { FormControl, FormGroup, Validators } from "@angular/forms";

export class ProjectLineForm extends FormGroup {
    constructor() {
        super({
            id: new FormControl(null),
            projectName: new FormControl(null, Validators.maxLength(50)),
            startDate: new FormControl(null),
            endDate: new FormControl(null),
            noEndDate: new FormControl(false),
            invoicingReferenceNumber: new FormControl(null),
            differentInvoicingReferenceNumber: new FormControl(false),
            invoicingReferencePersonId: new FormControl(null),
            differentInvoicingReferencePerson: new FormControl(false),
            optionalInvoicingInfo: new FormControl(null),
            debtorNumber: new FormControl(null),
            differentDebtorNumber: new FormControl(false),
            invoiceRecipientId: new FormControl(null),
            differentInvoiceRecipient: new FormControl(false),
            modifiedById: new FormControl(null),
            modificationDate: new FormControl(null),
            consultantInsuranceOptionId: new FormControl(null),
            wasSynced: new FormControl(false)
        })

    }
    get id() {
        return this.get('id');
    }
    get projectName() {
        return this.get('projectName');
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
    get differentInvoicingReferencePerson() {
        return this.get('differentInvoicingReferencePerson');
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
    get differentInvoiceRecipient() {
        return this.get('differentInvoiceRecipient');
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
    get wasSynced() {
        return this.get('wasSynced');
    }
}