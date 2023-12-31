import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { EnumEntityTypeDto } from "src/shared/service-proxies/service-proxies";
import { CustomValidators } from "src/shared/utils/custom-validators";

export class WorkflowSalesMainForm extends UntypedFormGroup {
    constructor() {
        super({
            salesTypeId: new UntypedFormControl(null),
            deliveryTypeId: new UntypedFormControl(null),
            projectTypeId: new UntypedFormControl(null),
            marginId: new UntypedFormControl(null),
            projectCategoryId: new UntypedFormControl(null),
            primaryCategoryArea: new UntypedFormControl(null),
            primaryCategoryType: new UntypedFormControl(null),
            primaryCategoryRole: new UntypedFormControl(null),
            projectDescription: new UntypedFormControl(null),
            projectName: new UntypedFormControl(null, Validators.maxLength(100)),
            discountId: new UntypedFormControl(null),

            commissions: new UntypedFormArray([]),
            commissionedUsers: new UntypedFormArray([]),

            salesAccountManagerIdValue: new UntypedFormControl(null, CustomValidators.autocompleteValidator(['id'])),
            commissionAccountManagerIdValue: new UntypedFormControl(null),
            primarySourcer: new UntypedFormControl(null),
            contractExpirationNotification: new UntypedFormControl(null),
            customContractExpirationNotificationDate: new UntypedFormControl(null),

            remarks: new UntypedFormControl(null, Validators.maxLength(4000)),
            noRemarks: new UntypedFormControl(false)
        });
    }

    get salesTypeId() {
        return this.get('salesTypeId');
    }
    get projectTypeId() {
        return this.get('projectTypeId');
    }
    get deliveryTypeId() {
        return this.get('deliveryTypeId');
    }
    get marginId() {
        return this.get('marginId');
    }
    get projectCategoryId() {
        return this.get('projectCategoryId');
    }
    get primaryCategoryArea() {
        return this.get('primaryCategoryArea');
    }
    get primaryCategoryType() {
        return this.get('primaryCategoryType');
    }
    get primaryCategoryRole() {
        return this.get('primaryCategoryRole');
    }
    get projectDescription() {
        return this.get('projectDescription');
    }
    get projectName() {
        return this.get('projectName');
    }
    get discountId() {
        return this.get('discountId');
    }
    get commissions() {
        return this.get('commissions') as UntypedFormArray;
    }
    get commissionedUsers() {
        return this.get('commissionedUsers') as UntypedFormArray;
    }
    get salesAccountManagerIdValue () {
        return this.get('salesAccountManagerIdValue');
    }
    get commissionAccountManagerIdValue () {
        return this.get('commissionAccountManagerIdValue');
    }
    get primarySourcer () {
        return this.get('primarySourcer');
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

export class WorkflowSalesClientDataForm extends UntypedFormGroup {
    constructor() {
        super({
            // Client
            differentEndClient: new UntypedFormControl(true),
            directClientIdValue: new UntypedFormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['clientId'])]),
            directClientAddress: new UntypedFormControl(null),
            endClientIdValue: new UntypedFormControl(null, CustomValidators.autocompleteValidator(['clientId'])),
            endClientAddress: new UntypedFormControl(null),
            clientContactProjectManager: new UntypedFormControl(null, CustomValidators.autocompleteValidator(['id'])),
            // PDC Invoicing Entity (client)

            // Client Invoicing Recipient
            pdcInvoicingEntityId: new UntypedFormControl(null, Validators.required),
            clientInvoicingRecipientSameAsDirectClient: new UntypedFormControl(false, Validators.required),
            clientInvoicingRecipientIdValue: new UntypedFormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['clientId'])]),
            clientInvoicingRecipientAddress: new UntypedFormControl(null),
            // Client Invoicing Reference Person
            invoicePaperworkContactIdValue: new UntypedFormControl(null, [Validators.required, CustomValidators.autocompleteValidator(['id'])]),
            invoicingReferencePersonDontShowOnInvoice: new UntypedFormControl(false),
            // Client Evaluations - Consultant
            evaluationsReferencePersonIdValue: new UntypedFormControl(null, CustomValidators.autocompleteValidator(['id'])),
            evaluationsDisabled: new UntypedFormControl(false),
            evaluationsDisabledReason: new UntypedFormControl(null),

            // Client Contract Signers
            contractSigners: new UntypedFormArray([]),

            // Client Special Contract Terms
            specialContractTerms: new UntypedFormControl(null, Validators.required),
            noSpecialContractTerms: new UntypedFormControl(false),

            // Client Rate & Invoicing
            clientRateTypeId: new UntypedFormControl(null),
            normalRate: new UntypedFormControl(null, Validators.required),
            clientCurrencyId: new UntypedFormControl(null, Validators.required),
            rateUnitTypeId: new UntypedFormControl(null),
            invoiceCurrencyId: new UntypedFormControl(null, Validators.required),
            clientInvoiceFrequency: new UntypedFormControl(null),
            clientInvoiceTime: new UntypedFormControl(null),
            manualDate: new UntypedFormControl(null),

            // frame agreement
            frameAgreementId: new UntypedFormControl(null),

            // clientRatesNFees
            clientFees: new UntypedFormArray([]),
            clientRates: new UntypedFormArray([]),

            // Client Contract Duration
            startDate: new UntypedFormControl(null, Validators.required),
            endDate: new UntypedFormControl(null, Validators.required),
            noEndDate: new UntypedFormControl(false),

            // Client Extension Option
            clientExtensionDurationId: new UntypedFormControl(null),
            clientExtensionSpecificDate: new UntypedFormControl(null),
            clientExtensionDeadlineId: new UntypedFormControl(null),
            noClientExtensionOption: new UntypedFormControl(false),

            // Client project
            clientTimeReportingCapId: new UntypedFormControl(false),
            timeReportingCaps: new UntypedFormArray([]),
            purchaseOrders: new UntypedFormArray([]),
        });
    }

    // Client
    get differentEndClient() {
        return this.get('differentEndClient');
    }
    get directClientIdValue() {
        return this.get('directClientIdValue');
    }
    get directClientAddress() {
        return this.get('directClientAddress');
    }
    get endClientIdValue() {
        return this.get('endClientIdValue');
    }
    get endClientAddress() {
        return this.get('endClientAddress');
    }
    get clientContactProjectManager() {
        return this.get('clientContactProjectManager');
    }

    // PDC Invoicing Entity (client)
    get pdcInvoicingEntityId() {
        return this.get('pdcInvoicingEntityId');
    }
    get clientInvoicingRecipientSameAsDirectClient() {
        return this.get('clientInvoicingRecipientSameAsDirectClient');
    }
    get clientInvoicingRecipientIdValue() {
        return this.get('clientInvoicingRecipientIdValue');
    }
    get clientInvoicingRecipientAddress() {
        return this.get('clientInvoicingRecipientAddress');
    }
    get invoicePaperworkContactIdValue() {
        return this.get('invoicePaperworkContactIdValue');
    }
    get invoicingReferencePersonDontShowOnInvoice() {
        return this.get('invoicingReferencePersonDontShowOnInvoice');
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
        return this.get('contractSigners') as UntypedFormArray;
    }
    get specialContractTerms() {
        return this.get('specialContractTerms');
    }
    get noSpecialContractTerms() {
        return this.get('noSpecialContractTerms');
    }

    // CLient rate and invoicing
    get clientRateTypeId() {
        return this.get('clientRateTypeId');
    }
    get normalRate() {
        return this.get('normalRate');
    }
    get clientCurrencyId() {
        return this.get('clientCurrencyId');
    }
    get rateUnitTypeId() {
        return this.get('rateUnitTypeId');
    }
    get invoiceCurrencyId() {
        return this.get('invoiceCurrencyId');
    }
    get clientInvoiceFrequency() {
        return this.get('clientInvoiceFrequency');
    }
    get clientInvoiceTime() {
        return this.get('clientInvoiceTime');
    }
    get manualDate() {
        return this.get('manualDate');
    }
    get clientSpecialRatePrice() {
        return this.get('clientSpecialRatePrice');
    }
    get clientSpecialRateCurrency() {
        return this.get('clientSpecialRateCurrency');
    }

    get frameAgreementId() {
        return this.get('frameAgreementId');
    }

    //clientFees

    get clientFees() {
        return this.get('clientFees') as UntypedFormArray;
    }

    get clientRates() {
        return this.get('clientRates') as UntypedFormArray;
    }

    // Client Contract Duration
    get startDate() {
        return this.get('startDate');
    }
    get endDate() {
        return this.get('endDate');
    }
    get noEndDate() {
        return this.get('noEndDate');
    }

    // Client Extension Option
    get clientExtensionDurationId() {
        return this.get('clientExtensionDurationId');
    }
    get clientExtensionSpecificDate() {
        return this.get('clientExtensionSpecificDate');
    }
    get clientExtensionDeadlineId() {
        return this.get('clientExtensionDeadlineId');
    }
    get noClientExtensionOption() {
        return this.get('noClientExtensionOption');
    }
    get clientTimeReportingCapId() {
        return this.get('clientTimeReportingCapId');
    }
    get timeReportingCaps() {
        return this.get('timeReportingCaps') as UntypedFormArray;
    }
    get purchaseOrders() {
        return this.get('purchaseOrders') as UntypedFormArray;
    }

}

export class WorkflowSalesConsultantsForm extends UntypedFormGroup {
    constructor() {
        super({
            consultants: new UntypedFormArray([], Validators.minLength(1))
        });

    }
    get consultants() {
        return this.get('consultants') as UntypedFormArray;
    }
}

export enum ConsultantDiallogAction {
    Change = 1,
    Extend = 2,
    Terminate = 3
}

export class SalesTerminateConsultantForm extends UntypedFormGroup {
    constructor() {
        super({
            directClientId: new UntypedFormControl(null),
            endClientId: new UntypedFormControl(null),
            finalEvaluationReferencePerson: new UntypedFormControl(null),
            noEvaluation: new UntypedFormControl(false),
            causeOfNoEvaluation: new UntypedFormControl(null),
            terminationTime: new UntypedFormControl(null),
            endDate: new UntypedFormControl(null),
            terminationReason: new UntypedFormControl(null),
            causeOfNonStandardTerminationTime: new UntypedFormControl(null),
            additionalComments: new UntypedFormControl(null)
        });
    }
    get directClientId() {
        return this.get('directClientId');
    }
    get endClientId() {
        return this.get('endClientId');
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


export const ClientRateTypes: EnumEntityTypeDto[] = [
    new EnumEntityTypeDto({
        id: 1,
        name: 'Time based',
    }),
    new EnumEntityTypeDto({
        id: 2,
        name: 'Fixed',
    })
];

export class DocumentForm extends UntypedFormGroup {
    constructor() {
        super({
            documents: new UntypedFormArray([])
        })

    }
    get documents() {
        return this.get('documents') as UntypedFormArray;
    }
}

export enum EProjectTypes {
    VMShighMargin = 5,
    VMSlowMargin = 6,
    NearshoreVMShighMargin = 7,
    NearshoreVMSlowMargin = 8
}

export interface IClientAddress {
    id: number;
    displayValue: string;
    addressType: string;
    isHidden: boolean;
}

export enum EClientSelectionType {
    DirectClient = 1,
    EndClient = 2,
    InvoicingRecipient = 3,
    ClientOffice = 4
}

export enum ETimeReportingCaps {
    CapOnUnits = 1,
    CapOnValue = 2,
    IndividualCap = 3,
    NoCap = 4
}

export enum EValueUnitTypes {
    'Hours' = 1,
    'Days' = 2,
    'Months' = 4
}
