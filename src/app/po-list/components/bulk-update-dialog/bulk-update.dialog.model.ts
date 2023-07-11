export enum EBulkUpdateDiallogTypes {
    UpdateEmagineResponsible = 1,
    UpdateClientResponsible = 2
}

export interface IBulkUpdateDialogData {
    EBulkUpdateDiallogTypes: EBulkUpdateDiallogTypes;
    dialogTitle: string;
    dialogText: string;
    clientIds?: number[] | undefined;
    purchaseOrderIds?: number[];
    rejectButtonText: string;
    confirmButtonText: string;
    isNegative: boolean;
}
