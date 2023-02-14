import { ICustomCommand } from '../types';
import { ContextMenuCommandId, ContextMenuItem } from 'devexpress-richedit';

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
];

export const DEFAULT_CONTEXT_MENU_ITEM_IDS: Array<ContextMenuItem['id']> = [
	ContextMenuCommandId.Copy,
	ContextMenuCommandId.Cut,
	ContextMenuCommandId.Paste,
	ContextMenuCommandId.DecreaseParagraphIndent,
	ContextMenuCommandId.IncreaseParagraphIndent,
	ContextMenuCommandId.ShowFontDialog,
	ContextMenuCommandId.ShowParagraphDialog,
	ContextMenuCommandId.ShowBookmarkDialog,
	ContextMenuCommandId.OpenHyperlink,
	ContextMenuCommandId.SelectAll,
];

export const COMPARE_TAB_CONTEXT_MENU_ITEM_IDS: Array<ContextMenuItem['id']> = [
	ICustomCommand.KeepCurrentVersion,
	ICustomCommand.KeepNewVersion,
	ICustomCommand.KeepBothVersions,
];
