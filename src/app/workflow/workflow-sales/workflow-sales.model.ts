import { FormArray, FormControl, FormGroup, Validators } from "@angular/forms";
import { CustomValidators } from "src/shared/utils/custom-validators";

export class WorkflowSalesMainForm extends FormGroup {
    constructor() {
        super({
            salesType: new FormControl(null, Validators.required),
            deliveryType: new FormControl(null, Validators.required),
            projectType: new FormControl(null, Validators.required),
            margin: new FormControl(null, Validators.required),
            projectCategory: new FormControl(null, Validators.required),
            projectDescription: new FormControl(null, [Validators.required, Validators.maxLength(4000)]),
            projectName: new FormControl(null, [Validators.required, Validators.maxLength(100)]),

            discounts: new FormControl(null),

            commissions: new FormArray([]),

            salesAccountManagerIdValue: new FormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['id'])]),
            commissionAccountManagerIdValue: new FormControl(null),
            contractExpirationNotification: new FormControl(null),
            customContractExpirationNotificationDate: new FormControl(null),

            remarks: new FormControl(null),
            noRemarks: new FormControl(false)
        });
    }

    get salesType() {
        return this.get('salesType');
    }
    get projectType() {
        return this.get('projectType');
    }
    get deliveryType() {
        return this.get('deliveryType');
    }
    get margin() {
        return this.get('margin');
    }
    get projectCategory() {
        return this.get('projectCategory');
    }
    get projectDescription() {
        return this.get('projectDescription');
    }
    get projectName() {
        return this.get('projectName');
    }
    get discounts() {
        return this.get('discounts');
    }
    get commissions() {
        return this.get('commissions') as FormArray;
    }
    get salesAccountManagerIdValue () {
        return this.get('salesAccountManagerIdValue');
    }
    get commissionAccountManagerIdValue () {
        return this.get('commissionAccountManagerIdValue');
    }
    get contractExpirationNotification() {
        return this.get('contractExpirationNotification');
    }
    get customContractExpirationNotificationDate() {
        return this.get('customContractExpirationNotificationDate');
    }
    get remarks() {
        return this.get('remarks');
    }
    get noRemarks() {
        return this.get('noRemarks');
    }
}

export class WorkflowSalesClientDataForm extends FormGroup {
    constructor() {
        super({
            // Client
            differentEndClient: new FormControl(true),
            directClientIdValue: new FormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['clientId'])]),
            endClientIdValue: new FormControl(null, CustomValidators.autocompleteValidator(['clientId'])),

            // PDC Invoicing Entity (client)

            // Client Invoicing Recipient
            pdcInvoicingEntityId: new FormControl(null, Validators.required),
            clientInvoicingRecipientSameAsDirectClient: new FormControl(false, Validators.required),
            invoicingReferenceNumber: new FormControl(null),
            clientInvoicingRecipientIdValue: new FormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['clientId'])]),

            // Client Invoicing Reference Person
            invoicePaperworkContactIdValue: new FormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['id'])]),

            // Client Evaluations - Consultant
            evaluationsReferencePersonIdValue: new FormControl(null, CustomValidators.autocompleteValidator(['id'])),
            evaluationsDisabled: new FormControl(false),
            evaluationsDisabledReason: new FormControl(null),

            // Client Contract Signers
            contractSigners: new FormArray([]),

            // Client Special Contract Terms
            specialContractTerms: new FormControl(null, Validators.required),
            noSpecialContractTerms: new FormControl(false),

            // Client Rate & Invoicing
            clientRateAndInvoicing: new FormControl(null),
            clientPrice: new FormControl(null, Validators.required),
            clientCurrency: new FormControl(null, Validators.required),
            rateUnitTypeId: new FormControl(null),
            clientInvoiceCurrency: new FormControl(null, Validators.required),
            clientInvoiceFrequency: new FormControl(null),
            clientInvoiceTime: new FormControl(null),
            clientInvoicingDate: new FormControl(null),

            // clientRatesNFees
            clientFees: new FormArray([]),
            clientRates: new FormArray([]),

            // Client Contract Duration
            clientContractStartDate: new FormControl(null, Validators.required),
            clientContractEndDate: new FormControl(null, Validators.required),
            clientContractNoEndDate: new FormControl(false),

            // Client Extension Option
            clientExtensionDuration: new FormControl(null),
            clientExtensionEndDate: new FormControl(null),
            clientExtensionDeadline: new FormControl(null),
            noClientExtensionOption: new FormControl(false),

            // Client project
            capOnTimeReporting: new FormControl(false),
            capOnTimeReportingValue: new FormControl(null)
        });
    }

    // Client
    get differentEndClient() {
        return this.get('differentEndClient');
    }
    get directClientIdValue() {
        return this.get('directClientIdValue');
    }
    get endClientIdValue() {
        return this.get('endClientIdValue');
    }

    // PDC Invoicing Entity (client)
    get pdcInvoicingEntityId() {
        return this.get('pdcInvoicingEntityId');
    }
    get clientInvoicingRecipientSameAsDirectClient() {
        return this.get('clientInvoicingRecipientSameAsDirectClient');
    }
    get invoicingReferenceNumber() {
        return this.get('invoicingReferenceNumber');
    }
    get clientInvoicingRecipientIdValue() {
        return this.get('clientInvoicingRecipientIdValue');
    }
    get invoicePaperworkContactIdValue() {
        return this.get('invoicePaperworkContactIdValue');
    }
    get evaluationsReferencePersonIdValue() {
        return this.get('evaluationsReferencePersonIdValue');
    }
    get evaluationsDisabled() {
        return this.get('evaluationsDisabled');
    }
    get evaluationsDisabledReason() {
        return this.get('evaluationsDisabledReason');
    }
    get contractSigners() {
        return this.get('contractSigners') as FormArray;
    }
    get specialContractTerms() {
        return this.get('specialContractTerms');
    }
    get noSpecialContractTerms() {
        return this.get('noSpecialContractTerms');
    }

    // CLient rate and invoicing
    get clientRateAndInvoicing() {
        return this.get('clientRateAndInvoicing');
    }
    get clientPrice() {
        return this.get('clientPrice');
    }
    get clientCurrency() {
        return this.get('clientCurrency');
    }
    get rateUnitTypeId() {
        return this.get('rateUnitTypeId');
    }
    get clientInvoiceCurrency() {
        return this.get('clientInvoiceCurrency');
    }
    get clientInvoiceFrequency() {
        return this.get('clientInvoiceFrequency');
    }
    get clientInvoiceTime() {
        return this.get('clientInvoiceTime');
    }
    get clientInvoicingDate() {
        return this.get('clientInvoicingDate');
    }
    get clientSpecialRatePrice() {
        return this.get('clientSpecialRatePrice');
    }
    get clientSpecialRateCurrency() {
        return this.get('clientSpecialRateCurrency');
    }

    //clientFees

    get clientFees() {
        return this.get('clientFees') as FormArray;
    }

    get clientRates() {
        return this.get('clientRates') as FormArray;
    }

    // Client Contract Duration
    get clientContractStartDate() {
        return this.get('clientContractStartDate');
    }
    get clientContractEndDate() {
        return this.get('clientContractEndDate');
    }
    get clientContractNoEndDate() {
        return this.get('clientContractNoEndDate');
    }

    // Client Extension Option
    get clientExtensionDuration() {
        return this.get('clientExtensionDuration');
    }
    get clientExtensionEndDate() {
        return this.get('clientExtensionEndDate');
    }
    get clientExtensionDeadline() {
        return this.get('clientExtensionDeadline');
    }
    get noClientExtensionOption() {
        return this.get('noClientExtensionOption');
    }

    // Client Porject

    get capOnTimeReporting() {
        return this.get('capOnTimeReporting');
    }
    get capOnTimeReportingValue() {
        return this.get('capOnTimeReportingValue');
    }

}

export class WorkflowSalesConsultantsForm extends FormGroup {
    constructor() {
        super({
            consultantData: new FormArray([], Validators.minLength(1))
        })

    }
    get consultantData() {
        return this.get('consultantData') as FormArray;
    }
}

export enum ConsultantDiallogAction {
    Change = 1,
    Extend = 2,
    Terminate = 3
}

export class SalesTerminateConsultantForm extends FormGroup {
    constructor() {
        super({
            finalEvaluationReferencePerson: new FormControl(null),
            noEvaluation: new FormControl(null),
            causeOfNoEvaluation: new FormControl(null),
            terminationTime: new FormControl(null),
            endDate: new FormControl(null),
            terminationReason: new FormControl(null),
            causeOfNonStandardTerminationTime: new FormControl(null),
            additionalComments: new FormControl(null)
        });
    }

    get finalEvaluationReferencePerson() {
        return this.get('finalEvaluationReferencePerson');
    }
    get noEvaluation() {
        return this.get('noEvaluation');
    }
    get causeOfNoEvaluation() {
        return this.get('causeOfNoEvaluation');
    }
    get terminationTime() {
        return this.get('terminationTime');
    }
    get endDate() {
        return this.get('endDate');
    }
    get terminationReason() {
        return this.get('terminationReason');
    }
    get causeOfNonStandardTerminationTime() {
        return this.get('causeOfNonStandardTerminationTime');
    }
    get additionalComments() {
        return this.get('additionalComments');
    }
}

export const TenantList = [
	{
		id: 1,
		name: 'Denmark',
		code: 'DK',
	},
	{
		id: 27,
		name: 'France',
		code: 'FR',
	},
	{
		id: 10,
		name: 'Germany',
		code: 'DE',
	},
	{
		id: 25,
		name: 'International',
		code: 'EU',
	},
	{
		id: 8,
		name: 'Netherlands',
		code: 'NL',
	},
	{
		id: 17,
		name: 'Norway',
		code: 'NO',
	},
	{
		id: 4,
		name: 'Poland',
		code: 'PL',
	},
	{
		id: 2,
		name: 'Sweden',
		code: 'SE',
	},
];
