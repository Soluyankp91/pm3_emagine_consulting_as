export enum ICompareButtonType {
	Select = 'COMPARE_TAB_SELECT_BTN',
	Upload = 'COMPARE_TAB_UPLOAD_BTN',
	Compare = 'COMPARE_TAB_COMPARE_BTN',
}

export interface IDocumentCreator {
	id: number;
	name: string;
	externalId: string;
}

export enum IDocumentCreationReason {}

export interface IDocumentVersion {
	createdDateUtc: string;
	creationReason: IDocumentCreationReason;
	description: string;
	isCurrent: boolean;
	isDraft: boolean;
	version: number;
	createdBy: IDocumentCreator;
}

export interface IDocumentItem {
	agreementTemplateId?: number;
	name?: string | undefined;
	clientName?: string | undefined;
	agreementType?: any;
	linkState?: any;
	linkStateAccepted?: boolean | undefined;
	currentVersion?: number | undefined;
	languageId?: any;
	createdDateUtc?: string;
	isEnabled?: boolean;
	tenantIds?: number[] | undefined;
}
