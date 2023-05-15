import { EmployeeDto, EnvelopeStatus } from "src/shared/service-proxies/service-proxies";

export interface IUpdateData {
    eventName: string;
    args: AgreementSignalRArgs;
}

export interface AgreementSignalRArgs {
    agreementId?: number;
    clientPeriodId?: string,
    consultantPeriodId?: string,
}

export interface IAgreementEventData {
    agreementId: number,
    agreementIds: number[],
    newStatus: EnvelopeStatus,
    version: number,
    isDraft: boolean,
    clientPeriodId: string,
    consultantPeriodId: string,
    agreementTemplateId: number,
    employeeDtos: EmployeeDto[],
}

export enum EAgreementEvents {
    StatusUpdate = 'agreementsStatusUpdate',
    MetadataUpdate = 'agreementMetadataUpdate',
    Deleted = 'agreementDeleted',
    DocumentNewVersion = 'agreementDocumentNewVersion',
    ClientPeriodNewAgreement = 'clientPeriodNewAgreement',
    ConsultantPeriodNewAgreement = 'consultantPeriodNewAgreement',
    TemplateMetadataUpdate = 'agreementTemplateMetadataUpdate',
    TemplateDocumentNewVersion = 'agreementTemplateDocumentNewVersion',
    InEditState = 'agreementInEditState',
    PeriodAgreementCreationPendingState = 'periodAgreementCreationPendingState',
}


