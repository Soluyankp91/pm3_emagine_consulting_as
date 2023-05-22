import { UntypedFormArray, UntypedFormGroup } from "@angular/forms";
import * as moment from "moment";
import { EnvelopeStatus, AgreementValidityState, EnvelopeProcessingPath } from "src/shared/service-proxies/service-proxies";

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
    "legal-contract--status__deliveryFailure" = EnvelopeStatus.DeliveryFailure,
    "legal-contract--status__voided" = EnvelopeStatus.Voided,
    "legal-contract--status__declined" = EnvelopeStatus.Declined,
    "legal-contract--status__waitingForOthers" = EnvelopeStatus.WaitingForOthers,
    "legal-contract--status__completed" = EnvelopeStatus.Completed,
    "legal-contract--status__aboutToExpire" = EnvelopeStatus.AboutToExpire,
    "legal-contract--status__expired" = EnvelopeStatus.Expired,
    "reminder-sent" = EnvelopeStatus.ReminderSent,
    "signed" = EnvelopeStatus.PartiallySigned,
}

export enum ELegalContractStatusText {
    "Created" = EnvelopeStatus.Created,
    "Created in DocuSign" = EnvelopeStatus.CreatedInDocuSign,
    "Sent" = EnvelopeStatus.Sent,
    "Delivery failure" = EnvelopeStatus.DeliveryFailure,
    "Voided" = EnvelopeStatus.Voided,
    "Declined" = EnvelopeStatus.Declined,
    "Waiting for others" = EnvelopeStatus.WaitingForOthers,
    "Completed" = EnvelopeStatus.Completed,
    "About to expire" = EnvelopeStatus.AboutToExpire,
    "Expired" = EnvelopeStatus.Expired,
    "Signed" = EnvelopeStatus.PartiallySigned,
    "Reminder sent" = EnvelopeStatus.ReminderSent,
}

export enum ELegalContractModeIcon {
    "agreement-active-icon" = AgreementValidityState.Active,
    "agreement-active-outdated-icon" = AgreementValidityState.ActiveOutdatedTemplate,
    "agreement-inactive-icon" = AgreementValidityState.Inactive
}

export enum ELegalContractModeText {
    "Active" = AgreementValidityState.Active,
    "New version available" = AgreementValidityState.ActiveOutdatedTemplate,
    "Ended" = AgreementValidityState.Inactive
}

export enum ELegalContractSourceIcon {
    "via-email-icon" = EnvelopeProcessingPath.Email,
    "via-docusign-icon" = EnvelopeProcessingPath.DocuSign,
    "via-thirdparty-icon" = EnvelopeProcessingPath.ReceiveFromOtherParty
}

export enum ELegalContractSourceText {
    "Sent via email" = EnvelopeProcessingPath.Email,
    "Sent via DocuSign" = EnvelopeProcessingPath.DocuSign,
    "Receive from other party" = 3
}
