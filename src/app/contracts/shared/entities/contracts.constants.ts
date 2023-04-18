import { AgreementCreationMode } from 'src/shared/service-proxies/service-proxies';
import { CreationModeItem, Tab } from './contracts.interfaces';

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
	envelopeProcessingPath: 'Via',
	linkState: 'Mode',
	lastUpdatedByLowerCaseInitials: 'By',
	validity: 'Mode',
	linkStateAccepted: 'Approval',
	salesManager: 'SM',
	contractManager: 'CM',
};
export const MASTER_CREATION: CreationModeItem[] = [
	{
		label: 'Duplicate from master template',
		value: AgreementCreationMode.Duplicated,
	},
	{
		label: 'Template provided by other party',
		value: AgreementCreationMode.ProvidedByOtherParty,
		infoTip: 'Upload available in Editor',
	},
	{
		label: 'Create from scratch',
		value: AgreementCreationMode.FromScratch,
	},
];
export const CLIENT_AGREEMENTS_CREATION: CreationModeItem[] = [
	{
		label: 'Inherit from master template',
		value: AgreementCreationMode.InheritedFromParent,
	},
	{
		label: 'Duplicate from client specific template',
		value: AgreementCreationMode.Duplicated,
	},
	{
		label: 'Template provided by other party',
		value: AgreementCreationMode.ProvidedByOtherParty,
		infoTip: 'Upload available in Editor',
	},
	{
		label: 'Create from scratch',
		value: AgreementCreationMode.FromScratch,
	},
];
export const AGREEMENTS_CREATION: CreationModeItem[] = [
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
		infoTip: 'Upload available in Editor',
	},
	{
		label: 'Create from scratch',
		value: AgreementCreationMode.FromScratch,
	},
];

export const WORKFLOW_TEMPLATE_TYPES = [
	{
		label: 'Client Specific Templates',
		value: true,
	},
	{
		label: 'Relevant Master Templates',
		value: false,
	},
	{
		label: 'All Master Templates',
		value: 'undefined',
	},
];
export const DEFINITION_MAX_SIZE = 4000;
export const NOTES_MAX_SIZE = 4000;
export const NAME_TEMPLATE_MAX_SIZE = 500;
