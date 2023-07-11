import { PurchaseOrderNoteStatus } from "src/shared/service-proxies/service-proxies";

export enum EPONoteStatusIcon {
    'po-no-note-added-icon' = PurchaseOrderNoteStatus.NoNoteAdded,
    'po-read-note-icon' = PurchaseOrderNoteStatus.ReadNote,
    'po-note-unread-icon' = PurchaseOrderNoteStatus.UnreadNote,
}

export enum EPONoteStatusTooltip {
    'No note added' = PurchaseOrderNoteStatus.NoNoteAdded,
    'Read note' = PurchaseOrderNoteStatus.ReadNote,
    'Unread note' = PurchaseOrderNoteStatus.UnreadNote,
}
