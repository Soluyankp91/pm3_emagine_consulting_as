import * as moment from "moment";
import { DeliveryTypes, SalesTypes } from "../workflow/workflow-contracts/workflow-contracts.model";
import { PurchaseOrderCapType } from "src/shared/service-proxies/service-proxies";
import { EHeaderCells, IHeaderCell } from "./po-table/po-table.interfaces";

export const DISPLAYED_COLUMNS: string[] = [
    'select',
    'status',
    'note',
    'PONumber',
    'client',
    'lastUpdate',
    'wfPeriodId',
    'clientContact',
    'consultant',
    'salesType',
    'deliveryType',
    'capType',
    'amount',
    'units',
    'clientRate',
    'totalAmount',
    'amountLeft',
    'estimatedUnitsLeft',
    'startDate',
    'endDate',
    'contractManager',
    'accountManager',
    'actions',
];

export enum EPOStatus {
    AttentionRequired = 'Action required',
    ClientNotified = 'Client notified',
    CMActionRequired = 'CM action required',
    Completed = 'Completed'
}

export const DUMMY_DATA = [
    {
        id: 1,
        status: EPOStatus.AttentionRequired,
        note: 'Some note for PO number, some note.',
        PONumber: 'PL-123456',
        client: 'JN Data',
        lastUpdate: moment(),
        wfPeriodId: '16932/01',
        clientContact: 'Joanna Pietraszewska',
        consultant: 'Matt Nowak',
        salesType: SalesTypes.Recruitment,
        deliveryType: DeliveryTypes.ManagedService,
        capType: PurchaseOrderCapType.CapOnUnits,
        amount: 6000,
        units: 'Days',
        clientRate: 1000,
        clientRateCurrencyId: 1,
        clientRateUnitType: 1,
        totalAmount: 2000,
        amountLeft: 1234,
        estimatedUnitsLeft: 111,
        startDate: moment(),
        endDate: moment(),
        contractManager: 'Joanna Pietraszewska CM',
        accountManager: 'Joanna Pietraszewska AM'
    },
    {
        id: 1,
        status: EPOStatus.AttentionRequired,
        note: 'Some note for PO number, some note.',
        PONumber: 'PL-123456',
        client: 'JN Data',
        lastUpdate: moment(),
        wfPeriodId: '16932/01',
        clientContact: 'Joanna Pietraszewska',
        consultant: 'Matt Nowak',
        salesType: SalesTypes.Recruitment,
        deliveryType: DeliveryTypes.ManagedService,
        capType: PurchaseOrderCapType.CapOnUnits,
        amount: 6000,
        units: 'Days',
        clientRate: 1000,
        clientRateCurrencyId: 1,
        clientRateUnitType: 1,
        totalAmount: 2000,
        amountLeft: 1234,
        estimatedUnitsLeft: 111,
        startDate: moment(),
        endDate: moment(),
        contractManager: 'Joanna Pietraszewska CM',
        accountManager: 'Joanna Pietraszewska AM'
    },
    {
        id: 1,
        status: EPOStatus.AttentionRequired,
        note: 'Some note for PO number, some note.',
        PONumber: 'PL-123456',
        client: 'JN Data',
        lastUpdate: moment(),
        wfPeriodId: '16932/01',
        clientContact: 'Joanna Pietraszewska',
        consultant: 'Matt Nowak',
        salesType: SalesTypes.Recruitment,
        deliveryType: DeliveryTypes.ManagedService,
        capType: PurchaseOrderCapType.CapOnUnits,
        amount: 6000,
        units: 'Days',
        clientRate: 1000,
        clientRateCurrencyId: 1,
        clientRateUnitType: 1,
        totalAmount: 2000,
        amountLeft: 1234,
        estimatedUnitsLeft: 111,
        startDate: moment(),
        endDate: moment(),
        contractManager: 'Joanna Pietraszewska CM',
        accountManager: 'Joanna Pietraszewska AM'
    }
]
export const AGREEMENT_HEADER_CELLS: IHeaderCell[] = [
	{
		type: EHeaderCells.DEFAULT,
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
		class: 'recipientId-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		class: 'agreementType-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
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
		// filter: {
		// 	formControlName: 'salesTypeIds',
		// 	component: () =>
        //         import('../../contracts/shared/components/master-templates/filters/sales-types-filter/sales-types-filter.component').then(
		// 			(it) => it.SalesTypesFilterComponent
		// 		),
		// },
		class: 'salesType-column',
	},
	{
		type: EHeaderCells.FILTER,
		// filter: {
		// 	formControlName: 'deliveryTypeIds',
		// 	component: () =>
		// 		import('../../master-templates/filters/delivery-types-filter/delivery-types-filter.component').then(
		// 			(it) => it.DeliveryTypesFilterComponent
		// 		),
		// },
		class: 'deliveryType-column',
	},
	{
		type: EHeaderCells.FILTER,
		class: 'contractType-column',
	},
	{
		type: EHeaderCells.FILTER,
		class: 'mode-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		class: 'status-column',
	},
	{
		type: EHeaderCells.FILTER,
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
		// filter: {
		// 	formControlName: 'salesManager',
		// 	component: () =>
		// 		import('../../agreements/filters/sales-managers-filter/sales-managers-filter.component').then(
		// 			(it) => it.SalesManagersFilterComponent
		// 		),
		// },
		class: 'salesManager-column',
		sort: true,
	},
	{
		type: EHeaderCells.FILTER,
		// filter: {
		// 	formControlName: 'contractManager',
		// 	component: () =>
		// 		import('../filters/contact-manager-filter/contract-manager-filter.component').then(
		// 			(it) => it.ContractManagerFilterComponent
		// 		),
		// },
		class: 'contractManager-column',
		sort: true,
	},
];
