import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";

export class ProjectLineForm extends UntypedFormGroup {
    constructor() {
        super({
            id: new UntypedFormControl(null),
            projectName: new UntypedFormControl(null, Validators.maxLength(250)),
            startDate: new UntypedFormControl(null),
            endDate: new UntypedFormControl(null),
            noEndDate: new UntypedFormControl(false),
            invoicingReferenceNumber: new UntypedFormControl(null),
            differentInvoicingReferenceNumber: new UntypedFormControl(false),
            invoicingReferencePersonId: new UntypedFormControl(null),
            invoicingReferencePersonDontShowOnInvoice: new UntypedFormControl(false),
            differentInvoicingReferencePerson: new UntypedFormControl(false),
            optionalInvoicingInfo: new UntypedFormControl(null, Validators.maxLength(250)),
            debtorNumber: new UntypedFormControl(null),
            differentDebtorNumber: new UntypedFormControl(false),
            invoiceRecipientId: new UntypedFormControl(null),
            differentInvoiceRecipient: new UntypedFormControl(false),
            modifiedById: new UntypedFormControl(null),
            modificationDate: new UntypedFormControl(null),
            consultantInsuranceOptionId: new UntypedFormControl(null),
            wasSynced: new UntypedFormControl(false),
            isLineForFees: new UntypedFormControl(false),
            purchaseOrderId: new UntypedFormControl(null),
            markedForLegacyDeletion: new UntypedFormControl(false),
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
    get invoicingReferencePersonDontShowOnInvoice() {
        return this.get('invoicingReferencePersonDontShowOnInvoice');
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
    get isLineForFees() {
        return this.get('isLineForFees');
    }
    get purchaseOrderId() {
        return this.get('purchaseOrderId');
    }
    get markedForLegacyDeletion() {
        return this.get('markedForLegacyDeletion');
    }
}
