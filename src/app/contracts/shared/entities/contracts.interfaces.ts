import { SortDirection } from '@angular/material/sort';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import {
	AgreementCreationMode,
	AgreementTemplateMetadataLogListItemDto,
	AgreementTemplateParentChildLinkState,
	AgreementValidityState,
	CountryDto,
	EmployeeDto,
	EnumEntityTypeDto,
	EnvelopeProcessingPath,
	EnvelopeStatus,
	LegalEntityDto,
	LogOperationType,
} from 'src/shared/service-proxies/service-proxies';

export type KeyType = string | number;

export interface Tab {
	link: string;
	label: string;
	disabled?: boolean;
	icon?: string;
}

export interface MasterFiltersEnum {
	language: BaseEnumDto[];
	id: number[];
	agreementType: BaseEnumDto[];
	recipientTypeId: EnumEntityTypeDto[];
	legalEntityIds: LegalEntityDto[];
	salesTypeIds: EnumEntityTypeDto[];
	deliveryTypeIds: EnumEntityTypeDto[];
	contractTypeIds: EnumEntityTypeDto[];
	lastUpdatedByLowerCaseInitials: BaseEnumDto[];
	isEnabled: BaseEnumDto[];
}
export interface ClientFiltersEnum extends MasterFiltersEnum {
	linkState: BaseEnumDto[];
	linkStateAccepted: BaseEnumDto[];
}
export interface AgreementFiltersEnum {
	languageId: BaseEnumDto[];
	id: number[];
	legalEntityId: LegalEntityDto[];
	agreementType: BaseEnumDto[];
	recipientTypeId: EnumEntityTypeDto[];
	salesTypeIds: EnumEntityTypeDto[];
	deliveryTypeIds: EnumEntityTypeDto[];
	contractTypeIds: EnumEntityTypeDto[];
	validity: BaseEnumDto[];
	status: BaseEnumDto[];
	envelopeProcessingPath: BaseEnumDto[];
	salesManager: EmployeeDto[];
	contractManager: EmployeeDto[];
}

export interface Actions {
	label: string;
	actionType: string;
	actionIcon: string;
}
export interface SortDto {
	active: string;
	direction: SortDirection;
}
export interface PageDto {
	pageIndex: number;
	pageSize: number;
}
export type TemplatePayload<T> = [T, SortDto, PageDto, CountryDto[], string, any];
export interface BaseEnumDto {
	id: number | string | boolean;
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

export interface SettingsPageOptions {
	agreementTypes: BaseEnumDto[];
	recipientTypes: EnumEntityTypeDto[];
	legalEntities: LegalEntityDto[];
	salesTypes: EnumEntityTypeDto[];
	deliveryTypes: EnumEntityTypeDto[];
	contractTypes: EnumEntityTypeDto[];
	languages: BaseEnumDto[];
	signerTypes: BaseEnumDto[];
	signerRoles: EnumEntityTypeDto[];
}

export interface BaseAgreementTemplate {
	agreementType: string;
	recipientTypeId: string;

	definition: string;
	note: string;
	language: string;
	countryCode: string;
	contractTypeIds: string[];
	salesTypeIds: string[];
	deliveryTypeIds: string[];

	createdBy: EmployeeDto;
	createdDateUtc: moment.Moment;
	lastUpdatedBy: EmployeeDto;
	lastUpdateDateUtc?: moment.Moment;
	createdByLowerCaseInitials?: string;
	duplicationSourceAgreementTemplateId?: number;
	duplicationSourceAgreementTemplateName?: string;
	parentAgreementTemplateId?: number;
	parentAgreementTemplateName?: string;
}
export interface BaseMappedAgreementTemplatesListItemDto extends BaseAgreementTemplate {
	agreementTemplateId?: number;
	clientName?: string;
	name?: string;
	legalEntityIds?: string[];
	isEnabled?: boolean;
	actionList?: Actions[];
}
export interface BaseMappedAgreementListItemDto extends BaseAgreementTemplate {
	agreementId?: number;
	agreementName?: string;
	actualRecipient$?: Observable<any>;
	consultantName: string;
	companyName: string;

	agreementStatus?: EnvelopeStatus;
	legalEntityId?: string;
	salesManager: string;
	contractManager: string;

	startDate?: moment.Moment;
	endDate?: moment.Moment;
	validity: AgreementValidityState;

	duplicationSourceAgreementId: number;
	duplicationSourceAgreementName: string;

	parentAgreementTemplateIsMasterTemplate: boolean;
}
export type AgreementTemplate = BaseMappedAgreementTemplatesListItemDto & BaseMappedAgreementListItemDto;
export interface ClientMappedTemplatesListDto extends BaseMappedAgreementTemplatesListItemDto {
	clientName: string;
	linkState: AgreementTemplateParentChildLinkState;
	linkStateAcceptedBy: EmployeeDto;
	linkStateAcceptedDateUtc: moment.Moment;
	linkStateAccepted: boolean | undefined;
}
export interface MasterTemplatePreview {
	name: string;
	clientName: string;
}

export type MappedLog = AgreementTemplateMetadataLogListItemDto & {
	profilePictureUrl: string;
	date: moment.Moment;
	dayTime: string;
};
export const OperationsTypeMap = {
	[LogOperationType.Create]: 'added',
	[LogOperationType.Update]: 'changed',
	[LogOperationType.Delete]: 'deleted',
};

export interface MappedAgreementTableItem {
	language: string;
	countryCode: string;
	agreementId: number;
	agreementName: string;
	actualRecipientName: string;
	recipientTypeId: string;
	agreementType: string;
	legalEntityId: string;
	clientName: string;
	companyName: string;
	consultantName: string;
	salesTypeIds: string[];
	deliveryTypeIds: string[];
	contractTypeIds: string[];
	mode: AgreementValidityState;
	status: EnvelopeStatus;
	envelopeProcessingPath: EnvelopeProcessingPath;
	startDate: moment.Moment;
	endDate: moment.Moment;
	salesManager: EmployeeDto;
	contractManager: EmployeeDto;
	isWorkflowRelated: boolean;
	workflowId: string;
	receiveAgreementsFromOtherParty?: boolean;
	actionList: Actions[];
}
export interface CreationModeItem {
	label: string;
	value: AgreementCreationMode;
	infoTip?: string;
}
