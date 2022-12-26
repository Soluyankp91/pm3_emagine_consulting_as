import { AgreementLanguage, AgreementTemplateParentChildLinkState, AgreementType } from "src/shared/service-proxies/service-proxies";
import { KeyType } from "../../master-templates/template-editor/settings/settings.component";

export interface Tab {
    link: string;
    label: string;
    disabled?: boolean;
    icon?: string;
}
export interface BaseEnumDto {
    id: number | string;
    name: string;
}
export interface MappedTableCells {
    language: Record<KeyType, string>;
    agreementType: Record<KeyType, string>;
    recipientTypeId: Record<KeyType, string>;
    legalEntityIds: Record<KeyType, string>;
    salesTypeIds: Record<KeyType, string>;
    deliveryTypeIds: Record<KeyType, string>;
    contractTypeIds: Record<KeyType, string>;
}
export interface MappedAgreementTemplatesListItemDto{
    agreementTemplateId: number;
    name: string;
    agreementType: string;
    recipientTypeId: string;
    language: string;
    legalEntityIds: string[];
    contractTypeIds: string [];
    salesTypeIds: string[];
    deliveryTypeIds: string[];
    createdByLowerCaseInitials?: string;
    createdDateUtc: string;
    lastUpdatedByLowerCaseInitials?: string;
    lastUpdateDateUtc?: string;
    isEnabled: boolean;
    linkState?: AgreementTemplateParentChildLinkState;
    linkStateAccepted?: boolean | undefined;
}