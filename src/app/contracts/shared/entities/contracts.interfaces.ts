import { SortDirection } from '@angular/material/sort';
import {
	AgreementTemplateParentChildLinkState,
	CountryDto,
	EmployeeDto,
	EnumEntityTypeDto,
	LegalEntityDto,
} from 'src/shared/service-proxies/service-proxies';

export type KeyType = string | number;

export interface Tab {
	link: string;
	label: string;
	disabled?: boolean;
	icon?: string;
}

export type TableFiltersEnum = {
	[key: string]: CountryDto[] | BaseEnumDto[] | EnumEntityTypeDto[] | LegalEntityDto[] | EmployeeDto[] | BaseEnumDto[];
};
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
export type TemplatePayload = [TableFiltersEnum, SortDto, PageDto, CountryDto[], string];
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
	name: string;
	agreementType: string;
	recipientTypeId: string;
	language: string;
	legalEntityIds: string[];
	contractTypeIds: string[];
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
export interface ClientMappedTemplatesListDto extends BaseMappedAgreementTemplatesListItemDto {
	clientName: string;
}
