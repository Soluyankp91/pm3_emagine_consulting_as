import { SortDirection } from '@angular/material/sort';
import {
	AgreementTemplateMetadataLogListItemDto,
	AgreementTemplateParentChildLinkState,
	AgreementValidityState,
	CountryDto,
	EmployeeDto,
	EnumEntityTypeDto,
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
}
export interface AgreementFiltersEnum {
	language: BaseEnumDto[];
	id: number[];
	//consultantName ???
	//companyName ???
	// legalEntityIds: LegalEntityDto[];
	agreementType: BaseEnumDto[];
	recipientTypeId: EnumEntityTypeDto[];
	// salesTypeIds: EnumEntityTypeDto [],
	// deliveryTypesIds: EnumEntityTypeDto [],
	// contractTypeIds: EnumEntityTypeDto [],
	mode: BaseEnumDto[];
	status: BaseEnumDto[];
	saleManager: EmployeeDto[];
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
export type TemplatePayload<T> = [T, SortDto, PageDto, CountryDto[], string];
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

export interface BaseMappedAgreementTemplatesListItemDto {
	agreementTemplateId: number;
	definition: string;
	name: string;
	note: string;
	agreementType: string;
	recipientTypeId: string;
	language: string;
	countryCode: string;
	legalEntityIds: string[];
	contractTypeIds: string[];
	salesTypeIds: string[];
	deliveryTypeIds: string[];
	createdByLowerCaseInitials?: string;
	createdDateUtc: string;
	createdBy: string;
	lastUpdatedBy: string;
	lastUpdatedByLowerCaseInitials?: string;
	lastUpdateDateUtc?: string;
	isEnabled: boolean;
	duplicationSourceAgreementTemplateId?: number;
	duplicationSourceAgreementTemplateName?: string;
}
export interface ClientMappedTemplatesListDto extends BaseMappedAgreementTemplatesListItemDto {
	clientName: string;
	linkState: AgreementTemplateParentChildLinkState;
	linkStateAccepted: boolean | undefined;
}
export interface MasterTemplatePreview {
	name: string;
	clientName: string;
}

export type MappedLog = AgreementTemplateMetadataLogListItemDto & {
	profilePictureUrl: string;
	date: string;
	dayTime: string;
};
export const OperationsTypeMap = {
	[LogOperationType.Create]: 'added',
	[LogOperationType.Update]: 'changed',
	[LogOperationType.Delete]: 'deleted',
};
