export enum ERemoveOrOuploadDialogMode {
    Delete = 1,
    Void = 2,
    UploadNewDocument = 3
}

export const RemoveOrUploadDialogConfig: {[key: number]: IRemoveOrUploadDialogConfig} = {
    1: {
        confirmButtonText: 'Delete',
        title: 'The agreement will be permanently deleted from the system. Are you sure you wish to proceed?',
        header: 'Delete contract',
        formLabel: 'Reason for deleting contract'
    },
    2: {
        confirmButtonText: 'Void',
        title: 'The agreement will be voided for all parties, are you sure you wish to proceed?',
        header: 'Void contract',
        formLabel: 'Reason for voiding contract'
    },
    3: {
        confirmButtonText: 'Upload',
        title: 'The agreement will be marked as completed manually. Are you sure you wish to proceed?',
        header: 'Upload contract',
        formLabel: 'Reason for updating contract manually'
    }
}

export interface IRemoveOrUploadDialogConfig {
    confirmButtonText: string;
    title: string;
    header: string;
    formLabel: string;
}
