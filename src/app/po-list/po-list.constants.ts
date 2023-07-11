import { PurchaseOrderChasingStatus, PurchaseOrderStatus } from "src/shared/service-proxies/service-proxies";
import { Actions, EPoBotttomActionsType } from "./po-list.model";

export const DISPLAYED_COLUMNS: string[] = [
    'expand',
    'select',
    'status',
    'note',
    'Number',
    'client',
    'ModifiedOnUtc',
    'wfPeriodId',
    'clientContact',
    'consultant',
    'salesType',
    'deliveryType',
    'CapForInvoicing_Type',
    'amount',
    'CapForInvoicing_ValueUnitTypeId',
    'clientRate',
    'totalAmount',
    'amountLeft',
    'estimatedUnitsLeft',
    'StartDate',
    'EndDate',
    'ContractResponsible',
    'SalesResponsible',
    'actions',
];

export const FILTER_LABEL_MAP: { [key: string]: string } = {
    status: 'Status',
	note: 'Note',
	client: 'Client',
	clientContact: 'Client contact',
	consultant: 'Consultant',
	salesTypeIds: 'Sales type',
	deliveryTypeIds: 'Delivery type',
    capTypeIds: 'Cap',
	unit: 'Units',
	clientRate: 'Client rate',
	contractManager: 'CM',
	salesManager: 'SM',
};

export enum EPOStatus {
    AttentionRequired = 'Action required',
    ClientNotified = 'Client notified',
    CMActionRequired = 'CM action required',
    Completed = 'Completed'
}

export const PO_BOTTOM_ACTIONS: Actions[] = [
	{
		label: 'Assign emagine PO responsible',
		actionType: EPoBotttomActionsType.AssignEmaginePOResponsible,
		actionIcon: 'assign-emagine-responsible',
	},
	{
		label: 'Assign Client PO responsible',
		actionType: EPoBotttomActionsType.AssignClientPOResponsible,
		actionIcon: 'assign-client-responsible',
	},
    {
		label: 'Mark as completed',
		actionType: EPoBotttomActionsType.MarkAsCompleted,
		actionIcon: 'mark-as-completed',
	}
];

export const NOTE_FILTER_OPTIONS = [
    {
        id: 1,
        name: 'Unread note',
        icon: 'unread-note-icon'
    },
    {
        id: 2,
        name: 'No note added',
        icon: 'no-note-added-icon'
    },
    {
        id: 3,
        name: 'Read note',
        icon: 'read-note-icon'
    }
];

export const CAP_FILTER_OPTIONS = [
    {
        id: 1,
        name: 'Cap on value',
    },
    {
        id: 2,
        name: 'Cap on units',
    },
];


export const PO_STATUSES = [
    {
        id: PurchaseOrderStatus.Missing,
        name: 'Missing',
    },
    {
        id: PurchaseOrderStatus.Active,
        name: 'Active',
    },
    {
        id: PurchaseOrderStatus.RunningOut,
        name: 'Running out',
    },
];

export const PO_CHASING_STATUSES = [
    {
        id: PurchaseOrderChasingStatus.ActionRequired,
        name: 'Action required',
    },
    {
        id: PurchaseOrderChasingStatus.CmNotified,
        name: 'CM notified',
    },
    {
        id: PurchaseOrderChasingStatus.AmNotified,
        name: 'AM notified',
    },
    {
        id: PurchaseOrderChasingStatus.ClientAndAmNotified,
        name: 'Client & AM notified',
    },
    {
        id: PurchaseOrderChasingStatus.ClientNotified,
        name: 'Client notified',
    },
    {
        id: PurchaseOrderChasingStatus.PendingOnClientSide,
        name: 'Pending on Client side',
    },
    {
        id: PurchaseOrderChasingStatus.Received,
        name: 'Received',
    },
];
