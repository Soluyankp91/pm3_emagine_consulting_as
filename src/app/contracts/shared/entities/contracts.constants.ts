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
	linkState: 'Mode',
	lastUpdatedByLowerCaseInitials: 'By',
};
