import { Actions } from 'src/app/contracts/shared/entities/contracts.interfaces';
import { EHeaderCells, IHeaderCell } from '../../mat-grid.interfaces';

export const DISPLAYED_COLUMNS: string[] = [
	'languageId',
	'agreementId',
	'agreementName',
	'actualRecipientName',
	'recipientTypeId',
	'agreementType',
	'legalEntityId',
	'clientName',
	'companyName',
	'consultantName',
	'salesTypeIds',
	'deliveryTypeIds',
	'contractTypeIds',
	'validity',
	'status',
	'envelopePath',
	'startDate',
	'endDate',
	'salesManager',
	'contractManager',
];
export const AGREEMENT_HEADER_CELLS: IHeaderCell[] = [
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'languageId',
			component: () =>
				import('../../master-templates/filters/agreement-languages-filter/agreement-filter.component').then(
					(it) => it.AgreementLanguagesFilterComponent
				),
		},
		class: 'language-column',
		sticky: true,
		sort: true,
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'ID',
		class: 'id-column',
		sticky: true,
		sort: true,
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'Agreement name',
		class: 'agreement-name-column',
		sticky: true,
		sort: true,
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'Actual Recipient',
		class: 'actual-recipient-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'recipientTypeId',
			component: () =>
				import('../../master-templates/filters/recipient-types-filter/recipient-types-filter.component').then(
					(it) => it.RecipientTypesFilterComponent
				),
		},
		class: 'recipientId-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'agreementType',
			component: () =>
				import('../../master-templates/filters/agreement-types-filter/agreement-types-filter.component').then(
					(it) => it.AgreementTypesFilterComponent
				),
		},
		class: 'agreementType-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'legalEntityId',
			component: () =>
				import('../../master-templates/filters/legal-entities-filter/legal-entities-filter.component').then(
					(it) => it.LegalEntitiesFilterComponent
				),
		},
		class: 'legalEntityId-column',
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'Client',
		class: 'client-column',
		sort: true,
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'Company name',
		class: 'company-column',
		sort: true,
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'Consultant name',
		class: 'consultant-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'salesTypeIds',
			component: () =>
				import('../../master-templates/filters/sales-types-filter/sales-types-filter.component').then(
					(it) => it.SalesTypesFilterComponent
				),
		},
		class: 'salesType-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'deliveryTypeIds',
			component: () =>
				import('../../master-templates/filters/delivery-types-filter/delivery-types-filter.component').then(
					(it) => it.DeliveryTypesFilterComponent
				),
		},
		class: 'deliveryType-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'contractTypeIds',
			component: () =>
				import('../../master-templates/filters/employment-types-filter/employment-types-filter.component').then(
					(it) => it.EmploymentTypesFilterComponent
				),
		},
		class: 'contractType-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'validity',
			component: () =>
				import('../../agreements/filters/mode-filter/mode-filter.component').then(
					(it) => it.AgreementModeFilterComponent
				),
		},
		class: 'mode-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'status',
			component: () =>
				import('../../agreements/filters/statuses-filter/statuses-filter.component').then(
					(it) => it.StatusesFilterComponent
				),
		},
		class: 'status-column',
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'envelopeProcessingPath',
			component: () =>
				import('../../agreements/filters/envelope-path-filter/envelope-path-filter.component').then(
					(it) => it.EnvelopePathFilterComponent
				),
		},
		class: 'envelopeProcessingPath-column',
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'Strt. date',
		class: 'start-date-column',
		sort: true,
	},
	{
		type: EHeaderCells.DEFAULT,
		title: 'Exp. date',
		class: 'end-date-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'salesManager',
			component: () =>
				import('../../agreements/filters/sales-managers-filter/sales-managers-filter.component').then(
					(it) => it.SalesManagersFilterComponent
				),
		},
		class: 'salesManager-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		filter: {
			formControlName: 'contractManager',
			component: () =>
				import('../filters/contact-manager-filter/contract-manager-filter.component').then(
					(it) => it.ContractManagerFilterComponent
				),
		},
		class: 'contractManager-column',
		sort: true,
	},
];

export const PAGE_SIZE_OPTIONS: number[] = [20, 50, 100];
export const AUTOCOMPLETE_SEARCH_ITEMS_COUNT = 100;
export const DEFAULT_SIZE_OPTION: number = PAGE_SIZE_OPTIONS[0];
export const BASE_AGREEMENT_ACTIONS: Actions[] = [
	{
		label: 'Upload signed contract',
		actionType: 'UPLOAD_SIGNED_CONTRACT',
		actionIcon: 'legal-contract-upload',
	},
	{
		label: 'Download *.pdf',
		actionType: 'DOWNLOAD_PDF',
		actionIcon: 'pdf-download-icon',
	},
	{
		label: 'Download *.doc',
		actionType: 'DOWNLOAD_DOC',
		actionIcon: 'doc-download-icon',
	},
];
export const AGREEMENT_BOTTOM_ACTIONS: Actions[] = [
	{
		label: 'Send reminder',
		actionType: 'REMINDER',
		actionIcon: 'send-reminder-icon',
	},
	{
		label: 'Download',
		actionType: 'DOWNLOAD',
		actionIcon: 'download-agreement-icon',
	},
];
export const INITIAL_PAGE_INDEX = 0;

export const MODE_FILTER_OPTIONS = [
	{
		id: 0,
		name: 'Active',
	},
	{
		id: 1,
		name: 'New version available',
	},
	{
		id: 2,
		name: 'Ended',
	},
	{
		id: 3,
		name: 'Not started yet',
	},
];
export const ENVELOPEPATH_FILTER_OPTIONS = [
	{
		id: 2,
		name: 'Sent via DocuSign',
	},
	{
		id: 1,
		name: 'Sent via email',
	},
	{
		id: 3,
		name: 'Receive from other party',
	},
];
export const STATUTES = [
	{
		id: 1,
		name: 'Created',
		color: '#50BEE8',
	},
	{
		id: 2,
		name: 'Created in DocuSign',
		color: '#50BEE8',
	},
	{
		id: 3,
		name: 'Sent',
		color: '#FAAD19',
	},
	{
		id: 9,
		name: 'Waiting for others',
		color: '#9747FF',
	},
	{
		id: 10,
		name: 'Completed',
		color: '#17A297',
	},
	{
		id: 11,
		name: 'About to expire',
		color: '#F453B4',
	},
	{
		id: 12,
		name: 'Expired',
		color: '#F453B4',
	},
	{
		id: 6,
		name: 'Voided',
		color: '#FF7A78',
	},
	{
		id: 5,
		name: 'Delivery failure',
		color: '#FF7A78',
	},
	{
		id: 8,
		name: 'Declined',
		color: '#FF7A78',
	},
];
export const INVALIDA_ENVELOPE_DOWNLOAD_MESSAGE =
	'Invalid documents were selected. You can only download envelopes that contain a document. Please check if you are trying to download an Agreement that is set to always being received from other party.';
export const MANUAL_AGREEMENT_UPLOAD_MESSAGE =
	'The agreement will be marked as completed manually. Are you sure you wish to proceed?';
export const INVALID_MANUAL_AGREEMENT_UPLOAD_MESSAGE =
	'The agreement you try to upload has already been added and marked as completed. The existing file will be replaced with the new one, and will no longer be accessible. Are you sure you want to proceed?';
export const INVALID_REMINDER_MESSAGE = `Invalid agreements have been selected. You can only send reminders for Docusign agreements with the following statuses: <ul class='ul-list'><li>Sent</li><li>Waiting for others</li><li>About to expire</li></ul>`;
export const SEND_REMINDER_CONFIRMATION_MESSAGE = `You are sending a reminder to all recipients that need to complete an action on the selected agreement. Click send to confirm.`;
export const SEND_REMINDER_SUCCESS_MESSAGE = `Reminder for selected agreements has been sent successfully`;
