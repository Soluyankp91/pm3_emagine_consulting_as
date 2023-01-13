import { SortDirection } from '@angular/material/sort';
import {
	AgreementTemplateParentChildLinkState,
	CountryDto,
	EmployeeDto,
	EnumEntityTypeDto,
	LegalEntityDto,
} from 'src/shared/service-proxies/service-proxies';
import { IFilterEnum } from '../base/base-contract';

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
export interface Actions {
	label: string;
	actionType: string;
}
export interface SortDto {
	active: string;
	direction: SortDirection;
}
export interface PageDto {
	pageIndex: number;
	pageSize: number;
}
export type TemplatePayload = [IFilterEnum, SortDto, PageDto, CountryDto[], string];
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
