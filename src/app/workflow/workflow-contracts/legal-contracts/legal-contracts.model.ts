import { UntypedFormArray, UntypedFormGroup } from "@angular/forms";
import * as moment from "moment";
import { WorkflowAgreementDto, EnvelopeStatus, AgreementValidityState, EmployeeDto } from "src/shared/service-proxies/service-proxies";

export class ClientLegalContractsForm extends UntypedFormGroup {
    constructor() {
        super({
            legalContracts: new UntypedFormArray([])
        })

    }
    get legalContracts() {
        return this.get('legalContracts') as UntypedFormArray;
    }
}

export enum ELegalContractStatusIcon {
    "legal-contract--status__created" = EnvelopeStatus.Created,
    "legal-contract--status__createdInDocuSign" = EnvelopeStatus.CreatedInDocuSign,
    "legal-contract--status__sent" = EnvelopeStatus.Sent,
    "legal-contract--status__viewed" = EnvelopeStatus.Viewed,
    "legal-contract--status__deliveryFailure" = EnvelopeStatus.DeliveryFailure,
    "legal-contract--status__voided" = EnvelopeStatus.Voided,
    "legal-contract--status__signed" = EnvelopeStatus.Signed,
    "legal-contract--status__declined" = EnvelopeStatus.Declined,
    "legal-contract--status__waitingForOthers" = EnvelopeStatus.WaitingForOthers,
    "legal-contract--status__completed" = EnvelopeStatus.Completed,
    "legal-contract--status__aboutToExpire" = EnvelopeStatus.AboutToExpire,
    "legal-contract--status__expired" = EnvelopeStatus.Expired,
}

export enum ELegalContractStatusText {
    "Created" = EnvelopeStatus.Created,
    "Created in DocuSign" = EnvelopeStatus.CreatedInDocuSign,
    "Sent" = EnvelopeStatus.Sent,
    "Viewed" = EnvelopeStatus.Viewed,
    "Delivery failure" = EnvelopeStatus.DeliveryFailure,
    "Voided" = EnvelopeStatus.Voided,
    "Signed" = EnvelopeStatus.Signed,
    "Declined" = EnvelopeStatus.Declined,
    "Waiting for others" = EnvelopeStatus.WaitingForOthers,
    "Completed" = EnvelopeStatus.Completed,
    "About to expire" = EnvelopeStatus.AboutToExpire,
    "Expired" = EnvelopeStatus.Expired,
}

export enum ELegalContractModeIcon {
    "agreement-active-icon" = AgreementValidityState.Active,
    "agreement-active-outdated-icon" = AgreementValidityState.ActiveOutdatedTemplate,
    "agreement-inactive-icon" = AgreementValidityState.Inactive
}

export const LegalContractsMockedData: WorkflowAgreementDto[] = [
    new WorkflowAgreementDto({
        agreementId: 2,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.Created,
        validity: AgreementValidityState.Active,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: false,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.CreatedInDocuSign,
        validity: AgreementValidityState.Active,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: false,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.Sent,
        validity: AgreementValidityState.Active,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: false,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.Viewed,
        validity: AgreementValidityState.Active,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: false,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.DeliveryFailure,
        validity: AgreementValidityState.Active,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: false,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.Voided,
        validity: AgreementValidityState.Active,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: false,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.Signed,
        validity: AgreementValidityState.Active,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: false,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.Declined,
        validity: AgreementValidityState.Active,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: true,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.WaitingForOthers,
        validity: AgreementValidityState.ActiveOutdatedTemplate,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: true,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.Completed,
        validity: AgreementValidityState.Inactive,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: false,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.AboutToExpire,
        validity: AgreementValidityState.Inactive,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: true,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    }),
    new WorkflowAgreementDto({
        agreementId: 1,
        name: 'JN Data A/S, Robertsen Oscar, 01.02.23',
        agreementStatus: EnvelopeStatus.Expired,
        validity: AgreementValidityState.ActiveOutdatedTemplate,
        lastUpdatedBy: new EmployeeDto({
            externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1',
            id: 51291,
            name: 'Sergii Laba',
        }),
        lastUpdateDateUtc: moment(),
        hasSignedDocumentFile: false,
        inEditByEmployeeDtos: [
            new EmployeeDto({ externalId: 'ee5a16fc-d9c9-4ae0-994b-6b796cd5cfe1', id: 51291, name: 'Sergii Laba' }),
        ],
    })

]
