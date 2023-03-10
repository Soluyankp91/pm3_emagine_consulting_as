import { ContextMenuItem } from 'devexpress-richedit';
import { IHighlightState, SidebarViewMode } from '.';
import { ICompareButtonMap, ICustomCommand } from './entities';

export const CompareButtons: ICompareButtonMap = {
	[ICustomCommand.SelectDocument]: {
		type: ICustomCommand.SelectDocument,
		title: 'Select document',
		icon: 'refresh',
	},
	[ICustomCommand.UploadDocument]: {
		type: ICustomCommand.UploadDocument,
		title: 'Upload document',
		icon: 'activefolder',
	},
	[ICustomCommand.CompareVersion]: {
		type: ICustomCommand.CompareVersion,
		title: 'Compare to version',
		icon: 'unselectall',
	},
	[ICustomCommand.ConfirmEdits]: {
		type: ICustomCommand.ConfirmEdits,
		title: 'Confirm edits',
		icon: 'save',
		beginGroup: true,
	},
	[ICustomCommand.UndoEdits]: { type: ICustomCommand.UndoEdits, title: 'Undo edits', icon: 'undo' },
	[ICustomCommand.CancelCompare]: { type: ICustomCommand.CancelCompare, title: '', icon: 'clear', beginGroup: true },
};

export const CUSTOM_CONTEXT_MENU_ITEMS: Array<ContextMenuItem> = [
	{
		id: ICustomCommand.KeepCurrentVersion,
		text: 'Keep text from current document (keep yellow, delete blue)',
		disabled: true,
		visible: false,
		beginGroup: false,
	},
	{
		id: ICustomCommand.KeepNewVersion,
		text: 'Keep text from other document (keep blue, delete yellow)',
		disabled: true,
		visible: false,
		beginGroup: false,
	},
	{
		id: ICustomCommand.KeepBothVersions,
		text: 'Keep both (must be modified/combined manually)',
		disabled: true,
		visible: false,
		beginGroup: false,
	},
	{
		id: ICustomCommand.SelectionHighlight,
		text: 'Highlight',
		disabled: true,
		visible: false,
		beginGroup: false,
		icon: 'rename',
	},
];

export const COMPARE_TAB_CONTEXT_MENU_ITEM_IDS: Array<ContextMenuItem['id']> = [
	ICustomCommand.KeepCurrentVersion,
	ICustomCommand.KeepNewVersion,
	ICustomCommand.KeepBothVersions,
];

export const InitialState: IHighlightState = {
	comments: [],
	enabled: false,
	viewMode: SidebarViewMode.View,
	commentIDs: [],
	selected: [],
	interval: null,
};

export const TEXT_SEPARATOR = '◬';
export const TEXT_PRE_CONTENT = 'DOCVARIABLE highlight ';