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
	language: 'Language',
	id: 'ID',
	agreementType: 'Type',
	recipientTypeId: 'Recipients',
	legalEntityIds: 'Legal entities',
	salesTypeIds: 'Sales type',
	deliveryTypeIds: 'Delivery type',
	contractTypeIds: 'Contract type',
	isEnabled: 'Status',
	status: 'Status',
	linkState: 'Mode',
	lastUpdatedByLowerCaseInitials: 'By',
	mode: 'Mode',
	saleManager: 'Sales Manager',
	contractManager: 'Contract Manager',
};

export const CREATION_RADIO_BUTTONS: { label: string; value: AgreementCreationMode }[] = [
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
