import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { IDropdownItem } from 'src/app/contracts/shared/components/emagine-menu-multi-select/emagine-menu-multi-select.interfaces';
import { SignerDropdowns } from 'src/app/contracts/shared/components/signers-table/signers-table.component';
import {
	AgreementSimpleListItemDto,
	ClientResultDto,
	ConsultantSalesDataDto,
	EmployeeDto,
	SimpleAgreementTemplatesListItemDto,
} from 'src/shared/service-proxies/service-proxies';

export type SignerOptions = {
	options$: Observable<
		[{ label: string; labelKey: string; outputProperty: string; dropdownType: SignerDropdowns }, IDropdownItem[]]
	> | null;
	optionsChanged$: Subject<string>;
};
export type ParentTemplateDto = {
	agreementTemplateId: string;
	currentVersion: string;
};

export type DuplicateOrParentOptions = {
	label: string;
	labelKey: string;
	formControlName: string;
	isDuplicate: boolean;
	outputProperty: string;
	options$: Observable<
		AgreementSimpleListItemDto[] | (SimpleAgreementTemplatesListItemDto & { disabled: boolean })[] | undefined
	>;
	optionsChanged$: BehaviorSubject<string>;
	unwrapFunction?: (arg: ParentTemplateDto) => ParentTemplateDto;
};
export type WorkflowSummary = {
	client: ClientResultDto;
	consultants: ConsultantSalesDataDto[];

	actualRecipient: ClientResultDto;
	legalEntityId: string;
	contractTypes: string[];
	salesManager: EmployeeDto;

	salesTypeId: string;
	deliveryTypeId: string;
	country: string;
	countryCode: string;
};
export const WorkflowLabelMap = {
	client: 'Client',
	contractType: 'Conctract type',
	consultant: 'Consultant',
	actualRecipient: 'Actual recipient',
	legalEntityId: 'Legal entity',
	salesManager: 'Sales Manager',
	salesTypeId: 'Sales type',
	deliveryTypeId: 'Delivery type',
	country: 'Country',
};
