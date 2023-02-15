import { RibbonButtonItem } from "devexpress-richedit";

export enum ICustomCommand {
	// Merge fields
	UpdateStyle = 'UPDATE_STYLE',
	ShowMergeFieldPopup = 'SHOW_MERGE_FIELD_POPUP',
	FormatPainter = 'FORMAT_PAINTER',

	// Compare
	SelectDocument = 'COMPARE_TAB_SELECT_DOCUMENT',
	UploadDocument = 'COMPARE_TAB_UPLOAD_DOCUMENT',
	CompareVersion = 'COMPARE_TAB_COMPARE_VERSION',
	KeepCurrentVersion = 'KEEP_CURRENT_VERSION',
	KeepNewVersion = 'KEEP_NEW_VERSION',
	KeepBothVersions = 'KEEP_BOTH_VERSIONS',
	ToggleCompareMode = 'TOGGLE_COMPARE_MODE',
}

export enum IContextMenuType {
	Default = 'DEFAULT',
	Compare = 'COMPARE',
}

export enum ITemplateSaveType {
	Draft,
	Complete,
}

export interface WrappedValueDto<TValue> {
	value: TValue;
}

export interface IDocumentCreator {
	id: number;
	name: string;
	externalId: string;
}

export type IMergeField = { [key: string]: string };

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

export interface ICompareTabOptions {
	id: string;
	title: string;
	buttons: Array<RibbonButtonItem>;
}

export interface ICompareButton {
	type: ICustomCommand.SelectDocument | ICustomCommand.UploadDocument | ICustomCommand.CompareVersion;
	title: string;
	icon: string;
}

export type ICompareButtons = Record<ICompareButton['type'], ICompareButton>;