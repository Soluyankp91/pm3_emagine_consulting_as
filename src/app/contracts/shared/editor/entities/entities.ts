import { RibbonButtonItem } from 'devexpress-richedit';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';
import { Moment } from 'moment';
import { AgreementCommentDto, AgreementTemplateEditReason } from 'src/shared/service-proxies/service-proxies';

export enum ICustomCommand {
    // Editor
    DocumentSave = 'DOCUMENT_SAVED',
    RibbonListChange = 'RIBBON_LIST_CHANGE',
    RibbonTabChange = 'RIBBON_TAB_CHANGE',
    // Merge fields
    UpdateStyle = 'UPDATE_STYLE',
    ShowMergeFieldPopup = 'SHOW_MERGE_FIELD_POPUP',
    FormatPainter = 'FORMAT_PAINTER',

    // Compare
    SelectDocument = 'COMPARE_TAB_SELECT_DOCUMENT',
    UploadDocument = 'COMPARE_TAB_UPLOAD_DOCUMENT',
    CompareVersion = 'COMPARE_TAB_COMPARE_VERSION',
    ServiceOrder = 'COMPARE_TAB_SERVICE_ORDER',
    ConfirmEdits = 'COMPARE_TAB_CONFIRM_EDITS',
    CancelCompare = 'COMPARE_TAB_CANCEL_EDITS',
    UndoEdits = 'COMPARE_TAB_UNDO_EDITS',
    KeepCurrentVersion = 'KEEP_CURRENT_VERSION',
    KeepNewVersion = 'KEEP_NEW_VERSION',
    KeepBothVersions = 'KEEP_BOTH_VERSIONS',
    ToggleCompareMode = 'TOGGLE_COMPARE_MODE',
    ToggleCommentMode = 'TOGGLE_COMMENT_MODE',
    SelectionHighlight = 'SELECTION_HIGHLIGHT',
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

export enum ICompareColors {
    CURRENT = '#FBF5D0',
    INCOMING = '#DFF1FF',
}
export interface IDocumentCreator {
    id: number;
    name: string;
    externalId: string;
}

export type IMergeField = { [key: string]: string };

export enum IDocumentCreationReason {}

export interface IDocumentVersion {
    createdDateUtc?: Date | Moment;
    creationReason?: AgreementTemplateEditReason | IDocumentCreationReason;
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
    createdDateUtc?: Date | Moment | string;
    isEnabled?: boolean;
    tenantIds?: number[] | undefined;
}

export interface ICompareTabOptions {
    id: string;
    title: string;
    buttons: Array<RibbonButtonItem>;
}

export interface ICompareTabOptions {
    id: string;
    title: string;
    buttons: Array<RibbonButtonItem>;
}

export type ICompareButtons =
    | ICustomCommand.SelectDocument
    | ICustomCommand.UploadDocument
    | ICustomCommand.CompareVersion
    | ICustomCommand.ConfirmEdits
    | ICustomCommand.UndoEdits
    | ICustomCommand.CancelCompare;

export interface ICompareButton {
    type?: ICompareButtons;
    title: string;
    icon: string;
    beginGroup?: boolean;
}

export interface ICompareChanges {
    isDone: boolean;
    line: number;
    text: string;
    groupId?: string;
    insertedLine?: number;
    type: 'delete' | 'insert' | 'replace';
}

export type ICompareButtonMap = Record<ICompareButton['type'], ICompareButton>;

export enum SidebarViewMode {
    Create,
    View,
    Edit,
}

export interface IHighlightState {
    comments: AgreementCommentDto[];
    enabled: boolean;
    viewMode: SidebarViewMode;
    selected: number[];
    interval: IntervalApi | null;
    highlights: Array<{ id: number; interval: IntervalApi }>;
}
