import { AgreementCreationMode } from 'src/shared/service-proxies/service-proxies';
import { Tab } from './contracts.interfaces';

export const CREATIONS_TABS: Tab[] = [
	{
		link: 'create',
		label: 'Settings',
	},
	{
		link: 'editor',
		label: 'Editor',
	},
];

export const FILTER_LABEL_MAP: { [key: string]: string } = {
    languageId: 'Language',
	language: 'Language',
	id: 'ID',
	agreementType: 'Type',
	recipientTypeId: 'Recipient',
	legalEntityIds: 'Legal entities',
	legalEntityId: 'Legal entity',
	salesTypeIds: 'Sales type',
	deliveryTypeIds: 'Delivery type',
	contractTypeIds: 'Contract type',
	isEnabled: 'Status',
	status: 'Status',
	linkState: 'Mode',
	lastUpdatedByLowerCaseInitials: 'By',
	mode: 'Mode',
	linkStateAccepted: 'Approval',
	saleManager: 'SM',
	contractManager: 'CM',
};

export const MASTER_CREATION: { label: string; value: AgreementCreationMode }[] = [
	{
		label: 'Duplicate from other agreement',
		value: AgreementCreationMode.Duplicated,
	},
	{
		label: 'Agreement provided by other party',
		value: AgreementCreationMode.ProvidedByOtherParty,
	},
	{
		label: 'Create from scratch',
		value: AgreementCreationMode.FromScratch,
	},
];
export const CLIENT_AGREEMENTS_CREATION: { label: string; value: AgreementCreationMode }[] = [
	{
		label: 'Inherit from template',
		value: AgreementCreationMode.InheritedFromParent,
	},
	{
		label: 'Duplicate from other agreement',
		value: AgreementCreationMode.Duplicated,
	},
	{
		label: 'Agreement provided by other party',
		value: AgreementCreationMode.ProvidedByOtherParty,
	},
	{
		label: 'Create from scratch',
		value: AgreementCreationMode.FromScratch,
	},
];
export const DEFINITION_MAX_SIZE = 4000;
export const NOTES_MAX_SIZE = 4000;
export const NAME_TEMPLATE_MAX_SIZE = 500;